from flask import Flask, json, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import spacy
import pickle
import random
import fitz
import re
import psycopg2
import urllib.parse as up
from flask_marshmallow import Marshmallow
from marshmallow.fields import Nested

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://iudtuhwa:0nTOH5GxzdSW6fiaUjaSWQr6sGUVTWtH@batyr.db.elephantsql.com/iudtuhwa'
db = SQLAlchemy(app)
ma = Marshmallow(app)


# ---------------------------- Helper methods -----------------------------------------
def json_response(payload, status=200):
  return (json.dumps(payload), status, {'content-type': 'application/json'})


def save_to_database(parsed_resume_attributes):
  applicant_email = parsed_resume_attributes['EMAIL']
  applicant_phone = parsed_resume_attributes['PHONE']
  applicant_name = parsed_resume_attributes['NAME']
  applicant_work_xp = parsed_resume_attributes['COMPANIES WORKED AT']
  applicant_degree = parsed_resume_attributes['DEGREE']
  applicant_location = parsed_resume_attributes['LOCATION']
  applicant_college = parsed_resume_attributes['COLLEGE NAME']
  applicant_skills = parsed_resume_attributes['SKILLS']

  if(not(applicant_email)):
    return json_response({'msg': 'Could not parse the email in the resume'}, 400)

  if(len(Applicant.query.filter_by(email=applicant_email).all()) > 0):
    return json_response({'msg': 'The applicant has already applied'}, 400)

  applicant = Applicant(email=applicant_email,
                        phone=applicant_phone,
                        name=applicant_name,
                        location=applicant_location)

  db.session.add(applicant)
  db.session.commit()

  applicant_resume = ApplicantResume(skills=applicant_skills,
                                     college=applicant_college,
                                     degree=applicant_degree,
                                     work_experience=applicant_work_xp,
                                     applicant_id=applicant.id)

  db.session.add(applicant_resume)
  db.session.commit()

  return json_response(serialize_data(), status=200)


def serialize_data():
  applicants = Applicant.query.order_by(Applicant.id.desc()).all()

  applicants_schema = ApplicantSchema(many=True)
  output = applicants_schema.dump(applicants, many=True)

  return {'applicants': output}


# ---------------------------- Object definitions -----------------------------------------
class Resume:
  def __init__(self):
    self.file = None
    self.resume_content = None


  def attach_resume(self, file):
    self.file = file


  def content_extractor(self):
    doc = fitz.open(stream=self.file.read(), filetype="pdf")
    content = ''

    # extract and flatten the content from resume
    for page in doc:
      content += str(page.getText())

    self.resume_content = " ".join(content.split('\n'))

    return self.resume_content


class EntityRecognizer:
  def __init__(self):
    self.resume = ''
    self.nlp_model = None
    self.resume_file = None

    self.inital_attributes = [('EMAIL', ''),
                         ('PHONE', ''), 
                         ('NAME', ''), 
                         ('COMPANIES WORKED AT', ''), 
                         ('DEGREE', ''),
                         ('LOCATION', ''), 
                         ('COLLEGE NAME', ''), 
                         ('SKILLS', '')]

    self.parsed_entities = dict(self.inital_attributes)


  def attach_content(self, content, file):
    self.resume = content
    self.parsed_entities = dict(self.inital_attributes)
    self.resume_file = file


  def recognize_resume(self):
    try:
      self.nlp_model = spacy.load('nlp_model')
    except:
      self.nlp_parsing()
      self.nlp_model = spacy.load('nlp_model')

    doc = self.nlp_model(self.resume)

    for entt in doc.ents:
      self.parsed_entities[entt.label_.upper()] = entt.text

    self.manual_parsing()
    return self.parsed_entities


  def manual_parsing(self):
    # regex and text setup 
    email_pattern = re.compile('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$')
    phone_pattern = re.compile('^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$')
    word_split = self.resume.split(' ')
    email_matches = []
    phone_matches = []

    # find email
    for i in word_split:
      if(email_pattern.search(i)):
        email_matches.append(i)

      if(phone_pattern.search(i)):
        phone_matches.append(i)

    if(len(email_matches) > 0):
      self.parsed_entities['EMAIL'] = email_matches[0]

    if(len(phone_matches) > 0):
      self.parsed_entities['PHONE'] = phone_matches[0]


  def nlp_parsing(self):
      # load the training data and language set
      train_data = pickle.load(open('train_data.pkl', 'rb'))
      nlp = spacy.blank('en')

      #create a new model and save it
      training_status = self.train(train_data, nlp)
      nlp.to_disk('nlp_model')

      return training_status


  def train(self, train_data, nlp):
    # create a new pipeline if ner does not exist
    if 'ner' not in nlp.pipe_names:
      ner = nlp.create_pipe('ner')
      nlp.add_pipe(ner, last = True)

    # add labels to the ner
    for _, annotation in train_data:
      for ent in annotation['entities']:
          ner.add_label(ent[2])
            
    # find all other pipes
    other_pipes = []
    for pipe in nlp.pipe_names:
      if(pipe != 'ner'):
        other_pipes.append(pipe)

    # remove other pipes and train on ner pipe only
    with nlp.disable_pipes(*other_pipes):
      optimizer = nlp.begin_training()
      
      for itn in range(10):
        print("Starting iteration " + str(itn))
        random.shuffle(train_data)
        losses = {}

        for text, annotations in train_data:
          try:
            nlp.update([text],
                      [annotations],
                      drop=0.2,  
                      sgd=optimizer,
                      losses=losses)
          
          except Exception as e:
            pass
              
        print(losses)
      
      return json_response({ 'training': 'A new trained model was created' })    


# ---------------------------- Initial setup and DB Models -------------------------------------------------


class Applicant(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(255), unique=True, nullable=False)
  name = db.Column(db.String(255))
  phone = db.Column(db.String(255), unique=True)
  location = db.Column(db.String(255))
  applicant_resume = db.relationship('ApplicantResume',
                                     backref='resume',
                                     cascade="all, delete-orphan")

  def __init__(self, email, phone, name='', location=''):
    self.email = email
    self.phone = phone
    self.name = name
    self.location = location

  def __repr__(self):
    return '<Applicant %r>' % self.email


class ApplicantResume(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  skills = db.Column(db.String(50000))
  college = db.Column(db.String(1000))
  degree = db.Column(db.String(500))
  work_experience = db.Column(db.String(50000))
  applicant_id = db.Column(db.Integer,
                           db.ForeignKey('applicant.id'),
                           nullable=False)

  def __init__(self, applicant_id, skills, college, degree, work_experience='', location=''):
    self.skills=skills
    self.college = college
    self.degree = degree
    self.work_experience = work_experience
    self.applicant_id = applicant_id

  def __repr__(self):
    return '<ApplicantResume %r>' % self.skills


# ---------------------------- Model Schemas -------------------------------------------------


class ApplicantResumeSchema(ma.SQLAlchemyAutoSchema):
  class Meta:
    model = ApplicantResume


class ApplicantSchema(ma.SQLAlchemyAutoSchema):
  applicant_resume = Nested(ApplicantResumeSchema, many=True)

  class Meta:
    model = Applicant


# ---------------------------- routes -------------------------------------------------
resume = Resume()
entity_recognizer = EntityRecognizer()


@app.route('/', methods=['GET', 'POST', 'DELETE'])
def index():
  if(request.method == 'GET'):
    return json_response(serialize_data(), status=200)

  if(request.method == 'DELETE'):
    data_string = request.data.decode('utf-8')
    data_dict = json.loads(data_string)

    obj=db.session.query(Applicant).filter(Applicant.id==data_dict['applicant_id']).first()
    db.session.delete(obj)
    db.session.commit()


    return json_response(serialize_data(), status=200)

  # read the resume pdf
  file = request.files.get('resume')

  if(not(file)):
    return json_response({'msg': 'No resume uploaded'}, 400)

  if(file.content_type != 'application/pdf'):
    return json_response({'msg': 'Resume must be in pdf format'}, 400)

  resume.attach_resume(file)
  resume_content = resume.content_extractor()

  entity_recognizer.attach_content(resume_content, file)
  parsed_resume_attributes = entity_recognizer.recognize_resume()

  return save_to_database(parsed_resume_attributes)


@app.route('/train')
async def train():
  return entity_recognizer.nlp_parsing()


if __name__ == "__main__":
  app.run(debug=True)
