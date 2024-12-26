import React,{ useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";

import './profileForm.css';

export default function ProfileForm({setActualUser, actualUser, setChangeBtn, setBtnText}){
    
    const [formData, setFormData] = useState({
        prenom: actualUser.prenom,
        nom: actualUser.nom,
        email: actualUser.email,
        tel: actualUser.tel,
        adresse: actualUser.adresse,
    });

    const handleUpdateProfile = async (updatedData) => {
        try {
            // console.log(updatedData)
            // Update Firestore user document
            const updatedUser = {
                prenom: updatedData.prenom,
                nom: updatedData.nom,
                email: actualUser.email,
                tel: updatedData.tel,
                adresse: updatedData.adresse,
                type: actualUser.type,
                vendeurs: actualUser.vendeurs,
                gains: actualUser.gains,
                a_encaisser: actualUser.a_encaisser
            }
            // Update the local state with the new data
            await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedUser);
            setActualUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // console.log('Profile updated successfully!');
        } 
        catch (error) { 
            console.error('Error updating profile:', error);
        }
        setChangeBtn(true);
        setBtnText('Modifier mon profil')
    };
        
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdateProfile(formData);
    };
    
    return (
        <div className='profileForm'>
            <h2 className='title'>Modifier mon profil</h2>
            <form onSubmit={handleSubmit} className='formUser'>
                <div >
                    <div className='boxInfo'>
                        <h3>Coordonnées</h3>
                        <label className='info'>
                            Prénom : 
                            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} />
                        </label>
                        <label className='info'>
                            Nom :
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange} />
                        </label>
                        <label className='info'>
                            Adresse : 
                            <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
                        </label>
                        <label className='info'>
                            Téléphone :
                            <input type="text" name="tel" pattern="^0[1-9]\d{8}$" maxLength={10} minLength={10} value={formData.tel} onChange={handleChange} />
                        </label>
                        
                    </div>
                </div>
                <button type="submit" className='updateBtn'> Sauvegarder</button>
            </form>
        </div>
    );
}