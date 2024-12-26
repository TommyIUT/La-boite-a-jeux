import React,{useEffect, useState} from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs } from "firebase/firestore";

import RoleView from './roleView/roleView';
import FestivalView from './festivalView/festivalView';
import FlexibiliteView from './flexibiliteView/flexibiliteView';
import { decryptData } from '../../components/encryption';

import './adminView.css';

export default function AdminView(props){

    const [listUserRole, setListUserRole] = useState([]);
    const [listUserFestival, setListUserFestival] = useState([]);
    const [listPoste, setListPoste] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const handleTabChange = (tab) => { setActiveTab((prevActiveTab) => (prevActiveTab === tab ? null : tab)); };

    useEffect(() => {
        const fetchPostesData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "postes"));
                var listPostes = []
                querySnapshot.forEach((doc) => {
                    listPostes.push({id: doc.id, data: doc.data()});
                });
                setListPoste(listPostes)
            } catch (error) {
                console.error('Error fetching postes data:', error);
            }
        }
        fetchPostesData(); 
    }, []);

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                var listUsersRole = [];
                var listUsersFestival = []
                querySnapshot.forEach((doc) => {
                    // console.log(auth.currentUser.uid);
                    listUsersFestival.push({id: doc.id, data: {
                        prenom: decryptData(doc.data().prenom),
                        nom: decryptData(doc.data().nom),
                        email: decryptData(doc.data().email),
                        pw: decryptData(doc.data().pw),
                        nbParticipation: decryptData(doc.data().nbParticipation),
                        hebergement: decryptData(doc.data().hebergement),
                        pseudo: decryptData(doc.data().pseudo),
                        adresse:decryptData(doc.data().adresse),
                        tel: decryptData(doc.data().tel),
                        role: doc.data().role,
                        jeuPrefere: decryptData(doc.data().jeuPrefere),
                    }});
                    if (auth.currentUser.uid !== doc.id) {
                        listUsersRole.push({id: doc.id, data: {
                            prenom: decryptData(doc.data().prenom),
                            nom: decryptData(doc.data().nom),
                            email: decryptData(doc.data().email),
                            pw: decryptData(doc.data().pw),
                            nbParticipation: decryptData(doc.data().nbParticipation),
                            hebergement: decryptData(doc.data().hebergement),
                            pseudo: decryptData(doc.data().pseudo),
                            adresse:decryptData(doc.data().adresse),
                            tel: decryptData(doc.data().tel),
                            role: doc.data().role,
                            jeuPrefere: decryptData(doc.data().jeuPrefere),
                        }});
                        // console.log(doc.id, " => ", doc.data());
                    }                    
                });
                setListUserFestival(listUsersFestival)
                setListUserRole(listUsersRole)
            } catch (error) {
                console.error('Error fetching games data:', error);
            }
        }
        fetchUsersData(); 
    }, []);

    
    return(
        <div className='adminView'>
            <h1>Administration</h1>

            <button type='button' className={`updateBtn ${activeTab === 'horaires' ? 'active' : ''}`} onClick={() => handleTabChange('horaires')}> Gestion des flexibilités </button>
            {activeTab === 'horaires' && <FlexibiliteView listUser={listUserRole} 
                                            affectations_p={props.affectations_p} 
                                            affectations_z={props.affectations_z} 
                                            jours={props.jours} 
                                            postes={props.postes} 
                                            plages={props.plages}
                                            zones={props.zones}
                                            setAffectations_p={props.setAffectations_p}
                                            setAffectations_z={props.setAffectations_z}
                                            />}

            <button type='button' className={`updateBtn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => handleTabChange('roles')}> Modifier les rôles </button>
            {activeTab === 'roles' && <RoleView listUser={listUserRole} setListUser={setListUserRole} />}

            <button type='button' className={`updateBtn ${activeTab === 'festival' ? 'active' : ''}`} onClick={() => handleTabChange('festival')}> Créer un festival </button>
            {activeTab === 'festival' && 
                <FestivalView 
                    setVal={props.setVal} 
                    listPoste={listPoste} 
                    listUser={listUserFestival} 
                    setListPoste={setListPoste}
                    setFestival={props.setFestival}
                />
            }
        </div>
    );
}