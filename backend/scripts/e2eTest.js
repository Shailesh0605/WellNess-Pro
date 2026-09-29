(async () => {
  try {
    const API = process.env.API_URL || 'http://localhost:4000'
    const ts = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14)
    const email = `test+${ts}@example.com`
    console.log('Using email:', email)

    const signupBody = {
      email,
      password: 'password123',
      name: 'Test User',
      age: 30,
      gender: 'other',
      height: 175,
      weight: 70,
      activityLevel: 'light',
      fitnessGoal: 'maintenance',
      medicalConditions: '',
      dietaryPreferences: '',
      profilePhoto: '',
    }

    const signupRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupBody),
    })
    const signupText = await signupRes.text()
    console.log('Signup status:', signupRes.status)
    console.log('Signup body:', signupText)

    if (!signupRes.ok) {
      console.error('Signup failed')
      process.exit(1)
    }

    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    })
    const loginJson = await loginRes.json()
    console.log('Login status:', loginRes.status)
    console.log('Login body:', loginJson)

    if (!loginRes.ok || !loginJson.accessToken) {
      console.error('Login failed or no accessToken returned')
      process.exit(1)
    }

    const token = loginJson.accessToken
    const profileRes = await fetch(`${API}/user/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    const profileText = await profileRes.text()
    console.log('Profile status:', profileRes.status)
    console.log('Profile body (raw):', profileText)

    if (!profileRes.ok) {
      console.error('Fetching profile failed')
      process.exit(1)
    }

    console.log('E2E test completed successfully')
    process.exit(0)
  } catch (err) {
    console.error('E2E test error', err)
    process.exit(1)
  }
})()
