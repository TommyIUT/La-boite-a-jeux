import React,{ useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from '../../components/encryption';

import ProfileRead from './profileRead/profileRead';
import ProfileForm from './profileForm/profileForm';

import './profileView.css';

export default function ProfileView({ setVal, actualUser, setActualUser }){

    const [changeBtn, setChangeBtn] = useState(true);
    const [btnText, setBtnText] = useState('Modifier mon profil');

    const changeRender = () => { 
        setChangeBtn(!changeBtn);
        setBtnText(!changeBtn ? 'Modifier mon profil' : 'Annuler');
    }

    return (
        <div className='profileView'>
            {changeBtn ? 
                <ProfileRead actualUser={actualUser} /> 
                : 
                <ProfileForm setChangeBtn={setChangeBtn} setBtnText={setBtnText} actualUser={actualUser} setActualUser={setActualUser}/>
            }
            <div className='btn'>
                <button type='button' className='updateBtn' onClick={changeRender}>{btnText}</button>
            </div>
        </div>
    );
}