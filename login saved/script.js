(function(){
  const KEY_USERS = 'demo-auth-users';
  const KEY_SESSION = 'demo-auth-currentUser';

  const $ = sel => document.querySelector(sel);
  const tabIn = $('#tabSignIn');
  const tabUp = $('#tabSignUp');
  const panelIn = $('#panelSignIn');
  const panelUp = $('#panelSignUp');
  const msg = $('#globalMessage');

  const inEmail = $('#inEmail');
  const inPass = $('#inPassword');
  const inEmailErr = $('#inEmailErr');
  const inPassErr = $('#inPasswordErr');

  const upEmail = $('#upEmail');
  const upPass = $('#upPassword');
  const upConf = $('#upConfirm');
  const upEmailErr = $('#upEmailErr');
  const upPassErr = $('#upPasswordErr');
  const upConfErr = $('#upConfirmErr');

  // Utilities
  const emailOk = (e)=> /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());
  const loadUsers = ()=> {
    try { return JSON.parse(localStorage.getItem(KEY_USERS)) || {}; } catch { return {}; }
  }
  const saveUsers = (u)=> localStorage.setItem(KEY_USERS, JSON.stringify(u));
  const setSession = (email)=> localStorage.setItem(KEY_SESSION, JSON.stringify({ email, at: Date.now() }));

  function showMessage(type, text){
    msg.textContent = text;
    msg.className = `message show ${type}`;
    // Auto-hide success after a moment
    if(type === 'success') {
      setTimeout(()=>{ msg.className = 'message'; msg.textContent=''; }, 3200);
    }
  }

  function clearErrors(){
    [inEmail, inPass, upEmail, upPass, upConf].forEach(i=> i && i.classList.remove('error'));
    [inEmailErr, inPassErr, upEmailErr, upPassErr, upConfErr].forEach(e=> e && (e.textContent=''));
  }

  function switchMode(mode){ // 'signin' | 'signup'
    clearErrors();
    if(mode === 'signup'){
      tabIn.setAttribute('aria-selected','false');
      tabUp.setAttribute('aria-selected','true');
      panelIn.classList.remove('active');
      panelIn.hidden = true;
      panelUp.hidden = false;
      requestAnimationFrame(()=> panelUp.classList.add('active'));
      msg.className = 'message'; msg.textContent='';
      upEmail.focus();
    } else {
      tabUp.setAttribute('aria-selected','false');
      tabIn.setAttribute('aria-selected','true');
      panelUp.classList.remove('active');
      panelUp.hidden = true;
      panelIn.hidden = false;
      requestAnimationFrame(()=> panelIn.classList.add('active'));
      msg.className = 'message'; msg.textContent='';
      inEmail.focus();
    }
  }

  tabIn.addEventListener('click', e=>{
    e.preventDefault();
    if(tabIn.getAttribute('aria-selected') === 'true') return;
    switchMode('signin');
  });

  tabUp.addEventListener('click', e=>{
    e.preventDefault();
    if(tabUp.getAttribute('aria-selected') === 'true') return;
    switchMode('signup');
  });

  document.querySelectorAll('.link[data-switch]').forEach(link=>{
    link.addEventListener('click', e=>{
      e.preventDefault();
      const mode = e.target.dataset.switch;
      switchMode(mode);
    });
  });

  // Sign In submit
  panelIn.addEventListener('submit', e=>{
    e.preventDefault();
    clearErrors();
    const email = inEmail.value.trim();
    const pass = inPass.value;

    let valid = true;
    if(!email) {
      inEmailErr.textContent = 'Email is required.';
      inEmail.classList.add('error');
      valid = false;
    } else if(!emailOk(email)){
      inEmailErr.textContent = 'Invalid email format.';
      inEmail.classList.add('error');
      valid = false;
    }
    if(!pass) {
      inPassErr.textContent = 'Password is required.';
      inPass.classList.add('error');
      valid = false;
    } else if(pass.length < 6){
      inPassErr.textContent = 'Password must be at least 6 characters.';
      inPass.classList.add('error');
      valid = false;
    }
    if(!valid) return;

    const users = loadUsers();
    if(!users[email]){
      showMessage('error', 'No account found with this email.');
      inEmail.classList.add('error');
      return;
    }
    if(users[email].password !== pass){
      showMessage('error', 'Incorrect password.');
      inPass.classList.add('error');
      return;
    }

    setSession(email);
    showMessage('success', `Welcome back, ${email}!`);
    // Reset form
    panelIn.reset();
  });

  // Sign Up submit
  panelUp.addEventListener('submit', e=>{
    e.preventDefault();
    clearErrors();
    const email = upEmail.value.trim();
    const pass = upPass.value;
    const conf = upConf.value;

    let valid = true;
    if(!email){
      upEmailErr.textContent = 'Email is required.';
      upEmail.classList.add('error');
      valid = false;
    } else if(!emailOk(email)){
      upEmailErr.textContent = 'Invalid email format.';
      upEmail.classList.add('error');
      valid = false;
    }
    if(!pass){
      upPassErr.textContent = 'Password is required.';
      upPass.classList.add('error');
      valid = false;
    } else if(pass.length < 6){
      upPassErr.textContent = 'Password must be at least 6 characters.';
      upPass.classList.add('error');
      valid = false;
    }
    if(conf !== pass){
      upConfErr.textContent = 'Passwords do not match.';
      upConf.classList.add('error');
      valid = false;
    }
    if(!valid) return;

    const users = loadUsers();
    if(users[email]){
      showMessage('error', 'An account with this email already exists.');
      upEmail.classList.add('error');
      return;
    }

    users[email] = { password: pass };
    saveUsers(users);
    setSession(email);
    showMessage('success', `Account created for ${email}!`);
    panelUp.reset();
    switchMode('signin');
  });

  // Initial focus
  inEmail.focus();
})();