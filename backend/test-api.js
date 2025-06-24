// Simple test to verify backend API connection
const testAPI = async () => {
  const baseURL = 'http://localhost:3004/api/v1';
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test signup
    console.log('\nTesting signup...');
    const signupData = {
      email: 'test@example.com',
      username: 'testuser123',
      password: 'testpass123'
    };
    
    const signupResponse = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });
    
    const signupResult = await signupResponse.json();
    console.log('Signup result:', signupResult);
    
    // Test login
    if (signupResult.success) {
      console.log('\nTesting login...');
      const loginData = {
        email: 'test@example.com',
        password: 'testpass123'
      };
      
      const loginResponse = await fetch(`${baseURL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      const loginResult = await loginResponse.json();
      console.log('Login result:', loginResult);
      
      if (loginResult.success && loginResult.token) {
        // Test profile endpoint
        console.log('\nTesting profile endpoint...');
        const profileResponse = await fetch(`${baseURL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
          },
        });
        
        const profileResult = await profileResponse.json();
        console.log('Profile result:', profileResult);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testAPI();
}

module.exports = { testAPI };
