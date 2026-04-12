async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 'admin', password: 'admin' })
    });
    if(!loginRes.ok) throw await loginRes.text();
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in");

    const eqRes = await fetch('http://localhost:5000/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Eq', serial_number: '999' })
    });
    if(!eqRes.ok) throw await eqRes.text();
    const eqData = await eqRes.json();
    const eqId = eqData._id;
    console.log("Created EQ", eqId);

    const statusRes = await fetch(`http://localhost:5000/api/equipment/${eqId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'maintenance' })
    });
    if(!statusRes.ok) throw await statusRes.text();
    console.log("Status success", await statusRes.json());
  } catch (err) {
    console.log("Error:", err);
  }
}
test();
