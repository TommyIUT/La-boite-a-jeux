import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

import './flexibiliteView.css';

export default function FlexibiliteView(props){

    const users = props.listUser;
    const [usersFlexibles, setUsersFlexibles] = useState([]);
    const [userFlexible, setUserFlexible] = useState('');
    const affectations_p = props.affectations_p;
    const affectations_z = props.affectations_z;
    const setAffectations_p = props.setAffectations_p;
    const setAffectations_z = props.setAffectations_z;
    const jours=props.jours;
    const zones=props.zones;
    const postes=props.postes;
    const plages=props.plages;


    // récupère les users flexibles sur des horaires
    useEffect(() => {
        // Créer un ensemble pour suivre les combinaisons id_user et id_plage dans les affectations_p et affectations_z
        const userPlageSet = new Set();

        // Parcourir les affectations_p et ajouter les combinaisons id_user et id_plage à l'ensemble
        affectations_p.forEach((affectationp) => {
            const { id_user, id_plage } = affectationp.data;
            const userPlageKey = `${id_user}_${id_plage}`;
            userPlageSet.add(userPlageKey);
        });
        affectations_z.forEach((affectationz) => {
            const { id_user, id_plage } = affectationz.data;
            const userPlageKey = `${id_user}_${id_plage}`;
            userPlageSet.add(userPlageKey);
        });

        // set d'id de mec qui sont flexibles
        const idflexibles = new Set();

        // Parcourir les affectations_z et compter les combinaisons id_user et id_plage déjà présentes dans l'ensemble
        affectations_z.forEach((affectationz) => {
            const { id_user, id_plage } = affectationz.data;
            const userPlageKey = `${id_user}_${id_plage}`;
            
            // Si la combinaison id_user et id_plage existe déjà dans l'ensemble, incrémenter le compteur de doublons
            if (userPlageSet.has(userPlageKey)) {
                idflexibles.add(id_user)
            }
        });

        const listflexibles = [];
        idflexibles.forEach((id)=>{
            users.map((user)=>{
                if (user.id===id){listflexibles.push(user)}
            })
        })
        

        setUsersFlexibles(listflexibles);
    }, [affectations_p, affectations_z, users]);

    // Supprime l'inscription d'un utilisateur à une zone d'acti
    async function unregisterZone(iduser, id_creneau, zone) {
        const zonecol = collection(db, 'affecter_zone');
        try {
            const querySnapshot = await getDocs(zonecol);
            querySnapshot.forEach(async (doc) => {
                const data = doc.data();
                    if (data.id_user === iduser && data.id_plage === id_creneau && data.zone === zone) {
                        await deleteDoc(doc.ref);
                        // console.log('Inscription supprimée');
                    }
            });
            setAffectations_z(affectations_z.filter(obj =>
                !(obj.data.id_user === iduser && obj.data.id_plage === id_creneau && obj.data.zone === zone)
            ))
        } 
        catch (error) {
            console.error('Erreur lors de la suppression de l\'inscription :', error);
        }
    }

    // Supprime l'inscription d'un utilisateur à un poste
    async function unregisterPoste(iduser, id_creneau, poste) {
        // console.log(iduser, id_creneau, poste)
        const postescol = collection(db, 'affecter_poste');
        try {
        const querySnapshot = await getDocs(postescol); 
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            if (data.id_user === iduser && data.id_plage === id_creneau && data.poste === poste) {
                await deleteDoc(doc.ref);
                // console.log('Inscription supprimée');
            }
            setAffectations_p(affectations_p.filter(obj =>
                !(obj.data.id_user === iduser && obj.data.id_plage === id_creneau && obj.data.poste === poste)
            ))
        });
        } 
        catch (error) {
            console.error('Erreur lors de la suppression de l\'inscription :', error);
        }
    }

    // check si l'utilisateur est inscrit dans une zone à un créneau donné
    const isRegisteredZone = (id_user, id_plage, zone) => {
        // console.log(affectations_z)
        return affectations_z.some((affect) => {
            return affect.data.id_user === id_user && affect.data.id_plage === id_plage && affect.data.zone === zone;
        });
    };

    // Vérifie si l'utilisateur est inscrit à un poste à un créneau donné
    const isRegisteredPoste = (id_user, id_plage, poste) => {
        return affectations_p.some((affect) => {
        return affect.data.id_user === id_user && affect.data.id_plage === id_plage && affect.data.poste === poste;
        });
    };

    return(
        <div className='flexibiliteView'>
            <label > Bénévole flexible : 
            <select type="text" name="benevole" value={userFlexible} onChange={(e) => setUserFlexible(e.target.value)}>
                <option value="">Sélectionner</option>
                {usersFlexibles.map((row) => (
                    <option key={row.id}  value={row.id}>{row.data.prenom} {row.data.nom}</option>
                ))}
            </select>
            </label>   
            {jours && postes && zones && plages && userFlexible &&(
                    <table>
                        <thead>
                            <tr>
                                <th className='borderright'></th>
                                {jours.map((unjour, index) => (
                                    <React.Fragment key={index}>
                                        <th className='borderleft'></th>
                                        <th></th>
                                        <th>{unjour.jour}</th>
                                        <th></th>
                                        <th className='borderright'></th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                                <th className='quadrille'>Poste</th>
                                {jours.map((unjour, index) => (
                                    <React.Fragment key={index}>
                                        <th className='quadrille'>9h-11h</th>
                                        <th className='quadrille'>11h-14h</th>
                                        <th className='quadrille'>14h-17h</th>
                                        <th className='quadrille'>17h-20h</th>
                                        <th className='quadrille'>20h-22h</th>
                                    </React.Fragment>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {postes.map((unposte,index) => (
                                <tr key={index}>
                                    <td>{unposte.data.intitule}</td>
                                    {plages.map((plage, index) => (
                                        <td key={index}>
                                            {isRegisteredPoste(userFlexible, plage.id, unposte.data.intitule) ?
                                                <button className='desinscription'
                                                onClick={()=>unregisterPoste(userFlexible, plage.id, unposte.data.intitule)}
                                                >Désinscrire</button>
                                                :
                                                ''
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {jours && postes && zones && plages && userFlexible && (
                    <table>
                        <thead>
                            <tr>
                                <th className='borderright'></th>
                                {jours.map((unjour, index) => (
                                    <React.Fragment key={index}>
                                        <th className='borderleft'></th>
                                        <th></th>
                                        <th>{unjour.jour}</th>
                                        <th></th>
                                        <th className='borderright'></th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                                <td className='quadrille'>Zones bénévoles</td>
                                {jours.map((value, index) => (
                                    <React.Fragment key={index}>
                                        <td className='quadrille'>9h-11h</td>
                                        <td className='quadrille'>11h-14h</td>
                                        <td className='quadrille'>14h-17h</td>
                                        <td className='quadrille'>17h-20h</td>
                                        <td className='quadrille'>20h-22h</td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map((unezone, index) => (
                                <tr key={index}>
                                    <td>{unezone.data.intitule}</td>
                                    {plages.map((plage, index) => (   
                                        <td key={index}>
                                            {isRegisteredZone(userFlexible, plage.id, unezone.data.intitule) ?
                                                <button 
                                                    className='desinscription'
                                                    onClick={()=>unregisterZone(userFlexible, plage.id, unezone.data.intitule)}>
                                                        Désinscrire
                                                </button>
                                            :
                                               ''
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}