// main.js - função utilitária global
const VALID_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function isValidEmail(email){
  return VALID_EMAIL_REGEX.test(String(email).toLowerCase());
}
function isValidText(s){
  return typeof s === 'string' && s.trim().length >= 3 && s.trim().length <= 50;
}
function isValidNumber(n){
  const v = Number(n);
  return !Number.isNaN(v) && v > 0 && v < 120;
}
function isValidURL(u){
  if(!u) return false;
  try {
    new URL(u);
    return true;
  } catch(e){
    return false;
  }
}
function showError(el, msg){
  let e = el.parentElement.querySelector('.error');
  if(!e){
    e = document.createElement('div');
    e.className = 'error';
    el.parentElement.appendChild(e);
  }
  e.textContent = msg;
}
function clearError(el){
  const e = el.parentElement.querySelector('.error');
  if(e) e.remove();
}
