![YOURTOUR2-copy750](https://github.com/user-attachments/assets/b6492b55-dddd-472e-b40e-82565fa1632d)

## API Docs
[Swagger Docs](http://ec2-18-222-210-86.us-east-2.compute.amazonaws.com:3000/api-docs)

## Flutter Repo
Link to see Flutter repo: [YourTour-Frontend](https://github.com/bridgeshayes/YourTour-Frontend.git)

# Installation

```bash
git clone https://github.com/bridgeshayes/YourTour-Server.git
cd /YourTour-Server
npm install
```

### Run Locally

```bash
node index.js
```

# CI/CD Pipeline

## Github Actions
.github/workflows/deploy.yaml is setup to automatically pull the latest code into the EC2 instance.

## PM2 
The EC2 instance has PM2 installed to run the server as a background process and ensure automatic 
restarts if the backend were to crash

### PM2 Commands

Start the backend as a processes
```bash
pm2 start index.js --name "yourtour"
```

Restart process
```bash
pm2 restart [process_id]
```

List out all running processes 
```bash
pm2 list
```

View logs
```bash
pm2 logs
```

View logs with PM2 CLI dashboard
```bash
pm2 monit
```
![image](https://github.com/user-attachments/assets/e14caffe-f6ae-43e7-92da-44d03e7fbcc5)


Stop specific process
```bash
pm2 stop [process_id]
```

Stop all processes
```bash
pm2 stop all
```

## Contact

For any questions, issues, or feedback, feel free to reach out to:

- **Name**: Garrett Hayes  
- **GitHub**: [Your GitHub Profile](https://github.com/bridgeshayes)
