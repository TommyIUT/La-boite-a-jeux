import React ,{useState} from 'react';
import { Link, NavLink, useNavigate, use} from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import logo from '../../images/logo.png'
import logo_hover from '../../images/logo_ouvert.png'

import './navBar.css'; // Importer le fichier CSS
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';

export default function NavBar({ actualUser, setVal }) {

    const navigate = useNavigate();
    const handleLogout = async () => { 
        try {
            await signOut(auth); // Déconnecte l'utilisateur de Firebase
            localStorage.removeItem('user'); // Supprime l'utilisateur du stockage local
    
            // Supprime le cookie (si utilisé)
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
            navigate('/login'); // Redirige vers la page de connexion
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };
    

    const [image, setImage] = useState(logo);

    return (
      <div className='navBar'>
          <NavLink id="nav-menu-button" to='/' onClick={() => console.log("affiche le menu")}>Menu</NavLink>
          <nav className='navigation'>
              {actualUser && actualUser.type !== 'rien' ? (
                  <>
                      <Link onClick={() => setVal(0)} to='/'>
                          <img className='logo' alt='logo' src={image}
                          onMouseEnter={() => setImage(logo_hover)}
                          onMouseLeave={() => setImage(logo)}></img>
                      </Link>
                      <NavLink className="current" to='/' onClick={() => setVal(0)}>Informations</NavLink>
                      {actualUser.type === 'admin' ?
                      (
                        <div>
                            <NavLink className="current" to='/' onClick={() => setVal(1)}>Sessions</NavLink>
                            <NavLink className="current" to='/' onClick={() => setVal(2)}>Utilisateurs</NavLink>
                        </div>
                        ) : (<div></div>)
                      }
                      {actualUser.type === 'gestionnaire' ?
                      (
                        <div>
                            <NavLink className="current" to='/' onClick={() => setVal(4)}>Vendeurs</NavLink>
                            <NavLink className="current" to='/' onClick={() => setVal(8)}>Bilan</NavLink>
                        </div>
                        ) : (<div></div>)
                      }
                      {actualUser.type === 'acheteur' ?
                      (
                        <div>
                            <NavLink className="current" to='/' onClick={() => setVal(6)}>Recherche</NavLink>
                            <NavLink className="current" to='/' onClick={() => setVal(7)}>Mes Commandes</NavLink>
                        </div>
                        ) : (<div></div>)
                      }
                  </>
              ) : (
                <div className='approb'>
                  <p >Veuillez attendre l'approbation d'un administrateur </p>
                  <p > pour utiliser cette application</p>
                </div>
              )}
              <NavLink className="monprofil" to='/' onClick={() => setVal(5)}>Mon Profil</NavLink>
              <IconButton 
                  className='icon'
                  color="primary" 
                  aria-label="Se déconnecter" 
                  variant="outlined" 
                  onClick={handleLogout}
                  sx={{
                      position: 'relative',
                      left: '37vw',
                      color: 'rgb(235, 101, 52)',
                      '&:hover': { color: 'black' },
                  }}
              >
                  <LogoutIcon />
              </IconButton>
          </nav>
      </div>
  );
}
