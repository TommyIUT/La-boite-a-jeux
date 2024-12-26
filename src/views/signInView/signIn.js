import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import logotxt from "../../images/logo_titre.png";
import "./signIn.css";

export default function SignIn(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleClickRegister = () => {
    navigate("/register");
  };

  // Fonction pour définir un cookie qui expire en 1 jour
  function setCookie(name, value) {
    const expires = new Date();
    expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 jour
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);
      var user = {};
      if (docSnap.exists()) {
        const dataUser = docSnap.data();
        user = {
          prenom: dataUser.prenom,
          nom: dataUser.nom,
          email: dataUser.email,
        };
      } else {
        console.log("No such document!");
      }

      setCookie("token", userCredential.user.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="signIn">
      <div className="left-panel">
        <h2 className="title">Se connecter</h2>
        <div className="fields">
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="input-field">
              <input
                type="email"
                placeholder="Mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="password"
                placeholder="Mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-button">
              <button type="submit" className="btn">
                Connexion
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="right-panel">
        <img src={logotxt} alt="Logo La Boîte à Jeux" className="logo-image" />
        <div className="content">
          <h3>Nouveau ici ?</h3>
          <div className="register-button">
            <button className="btn" onClick={handleClickRegister}>
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
