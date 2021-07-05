# Resume Scrapper

This project parses through resumes using natural language processing as well as manual parsing through regular expressions. It then returns this to the frontend application. It also saves the parsed applicant information in a hosted postgresql database.

## Things to improve
The project does not take in account any security. This means that nothing is encrypted and anyone can access anything. All API calls can be made easily by simply calling different HTTP protocols on them. This is something I would definetly change in the future as it is it gives anyone the access to work with the database. The URI keys of the database is also simply put into the file instead of being an environment variable. These are just a couple things that can be future additions to the project.

It was also my first time building an application with Flask, and therefore did not take into account any best practices while working in the Backend. My Frontend did however.

## Contributing
Parth Brahmbhatt
