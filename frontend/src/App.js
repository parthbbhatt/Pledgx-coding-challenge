import FileUpload from './components/FileUpload';
import ResumeDirectory from './components/ResumeDirectory';

function App() {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Parth's Resume Scrapper</h2>
      <FileUpload />
      <ResumeDirectory />
    </div>
  );
}

export default App;
