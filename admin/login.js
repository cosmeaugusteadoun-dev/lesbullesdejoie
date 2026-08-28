import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "../js/supabase-config.js";
import { initPasswordToggles } from "../js/password-toggle.js";

initPasswordToggles();

const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");
const errorText = document.getElementById("login-error-text");
const submitBtn = document.getElementById("login-submit");
const setupNotice = document.getElementById("setup-notice");

if (!isSupabaseConfigured) {
  setupNotice.classList.remove("hidden");
  setupNotice.classList.add("flex");
  form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "dashboard.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");
    submitBtn.disabled = true;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    submitBtn.disabled = false;
    if (error) {
      errorText.textContent = "Connexion impossible : email ou mot de passe incorrect.";
      errorBox.classList.remove("hidden");
      errorBox.classList.add("flex");
      return;
    }
    window.location.href = "dashboard.html";
  });
}
