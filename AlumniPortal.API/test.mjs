import axios from 'axios';

const payload = {
    historyContent: 'test',
    missionText: 'test',
    visionText: 'test',
    constitutionFileUrl: 'test'
};

async function run() {
    try {
        const login = await axios.post('http://localhost:5001/api/auth/login', {email: "admin@mist.edu", password: "Admin@123"});
        const token = login.data.data.token;
        console.log("Logged in nicely");
        
        const res = await axios.post('http://localhost:5001/api/website-content', payload, { headers: { Authorization: `Bearer ${token}` }});
        console.log("Success:", res.data);
    } catch(err) {
        console.log("Validation Failure Payload:");
        console.log(JSON.stringify(err.response ? err.response.data : err.message, null, 2));
    }
}
run();
