<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dashboard · Air-Health</title>
  <link rel="stylesheet" href="assets/css/main.css" />
</head>
<body class="page">
  <nav class="top-nav">
    <div class="logo">Air-Health</div>
    <ul class="nav-links">
      <li><a href="dashboard.html" class="active">Dashboard</a></li>
      <li><a href="chatbot.html">Chat & Alerts</a></li>
      <li><a href="profile.html">Profile</a></li>
      <li><a href="index.html">Logout</a></li>
    </ul>
  </nav>

  <main class="content-wrapper">
    <h1 class="page-title">Hello, <em>User!</em></h1>
    <p class="intro"><em>Breathe easy today.</em></p>

    <section class="card">
      <h2>Current AQI</h2>
      <p id="aqi-value">—</p>
    </section>

    <section class="card">
      <h2>Health Risk Status</h2>
      <p id="risk-status">—</p>
    </section>
  </main>

  <script src="assets/js/dashboard.js"></script>
</body>
</html>
