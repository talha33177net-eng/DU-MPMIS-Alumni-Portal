import axios from 'axios';

const payload = {
    historyContent: 'test',
    missionText: 'test',
    visionText: 'test',
    constitutionFileUrl: 'test'
};

async function run() {
    try {
        const res = await axios.post('http://localhost:5001/api/website-content', payload);
        console.log("Success:", res.data);
    } catch(err) {
        console.log("Validation Failure Payload:");
        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("StatusText:", err.response.statusText);
            console.log("Data:", err.response.data);
            console.log("Headers:", JSON.stringify(err.response.headers));
        } else {
            console.log("No Response Object:", err.message);
        }
    }
}
run();
