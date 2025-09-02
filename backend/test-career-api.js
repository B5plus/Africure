const FormData = require('form-data');
const { default: fetch } = require('node-fetch');
const fs = require('fs');

async function testCareerAPI() {
    try {
        console.log('🧪 Testing Career Application API...');
        
        // Create a simple test PDF file for resume
        const testResumeContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
        fs.writeFileSync('test-resume.pdf', testResumeContent);

        // Create form data
        const formData = new FormData();
        formData.append('fullName', 'John Doe');
        formData.append('email', 'john.doe@test.com');
        formData.append('phone', '+1234567890');
        formData.append('location', 'Test City');
        formData.append('position', 'supply-chain');
        formData.append('experience', '2-3');
        formData.append('qualification', 'bpharm');
        formData.append('coverLetter', 'This is a test cover letter.');
        formData.append('consent', 'on');
        formData.append('resume', fs.createReadStream('test-resume.pdf'), {
            filename: 'test-resume.pdf',
            contentType: 'application/pdf'
        });
        
        // Submit to API
        const response = await fetch('http://localhost:3002/api/careers/apply', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const result = await response.text();
        console.log('📊 Response Status:', response.status);
        console.log('📄 Response Body:', result);
        
        // Clean up test file
        if (fs.existsSync('test-resume.pdf')) {
            fs.unlinkSync('test-resume.pdf');
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.error('📋 Full Error:', error);
    }
}

testCareerAPI();
