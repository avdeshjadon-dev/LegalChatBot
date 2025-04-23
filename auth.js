// Simulated user database
const users = JSON.parse(localStorage.getItem('users')) || [];

function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Simple validation
  if (!email || !password) {
    showError('Please fill in all fields');
    return false;
  }

  // Check if user exists
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store authentication status and user data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Redirect to main app
    window.location.href = 'index.html';
  } else {
    showError('Invalid email or password');
  }
  
  return false;
}

function signupUser(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showError('Please fill in all fields');
    return false;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return false;
  }

  // Check if user already exists
  if (users.some(u => u.email === email)) {
    showError('Email already registered');
    return false;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password // Note: In a real app, you would hash the password
  };

  // Add to "database"
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Log in the new user
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  // Redirect to main app
  window.location.href = 'index.html';
  
  return false;
}

function showError(message) {
  // Find or create error message element
  let errorElement = document.querySelector('.error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    document.querySelector('.auth-form').appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  // For auth pages, redirect if already authenticated
  if (window.location.pathname.includes('login.html') || 
      window.location.pathname.includes('signup.html')) {
    if (localStorage.getItem('isAuthenticated')) {
      window.location.href = 'index.html';
    }
  }
  
  // For main app, redirect to login if not authenticated
  if (window.location.pathname.includes('index.html')) {
    if (!localStorage.getItem('isAuthenticated')) {
      window.location.href = 'login.html';
    }
  }
});

// Logout function
function handleLogout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}