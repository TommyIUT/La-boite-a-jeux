import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Papa from 'papaparse';

import './festivalView.css';

export default function FestivalView(props) {
    useEffect(() => {
        setErreur('');
    }, []);

    const listPoste = props.listPoste;
    const listUser = props.listUser;

    const [erreur, setErreur] = useState('');

    const [inputLines, setInputLines] = useState(listPoste);
    const [zone_benevole, setZone_benevole] = useState(new Set());
    const [zone_plan, setZone_plan] = useState(new Set());
    const [jeux, setJeux] = useState([]);
    const [joursfest, setJoursFest] = useState([]);
    const setVal = props.setVal;
    const joursDeLaSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const getDatesBetween = () =>  {
        let datedebut = new Date(formData.startDate)
        let datefin = new Date(formData.endDate)
        const currentDate = new Date(datedebut);
  
        var listJoursFest = []
        while (currentDate <= datefin) {
            listJoursFest.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setJoursFest(listJoursFest)
    }

    let ajd = new Date();

    const create_festival = async () => { 
        let datedebut = new Date(formData.startDate)
        let datefin = new Date(formData.endDate)
        getDatesBetween();
        if (datedebut < ajd || datefin<ajd){
            setErreur('Veuillez saisir une date ultérieure à aujourdhui')
        } else if (datedebut>datefin){
            setErreur('Les dates ne concordent pas')
        } else {
            // console.log(jeux)
            try {
                // ajout de jeux
                try {
                    const jeux_col = collection(db, 'games');
                    const jeux_doc = await getDocs(jeux_col);

                    localStorage.removeItem('games');
                
                    jeux_doc.forEach(async (document) => {
                        await deleteDoc(doc(jeux_col, document.id));
                    });
                
                    jeux.forEach(async (jeu) => {
                        try {
                            await addDoc(jeux_col, jeu.data);
                        } catch (error) {
                            console.error('Erreur lors de l\'ajout du jeu :', error);
                        }
                    });
                
                } 
                catch (error) {
                    console.error('Erreur bdd :', error);
                }
                
                // zones benevoles
                try {
                    const zones_ben_col = collection(db, 'zone_benevole');
                    const zones_ben_doc = await getDocs(zones_ben_col);
            
                    zones_ben_doc.forEach(async (document) => {
                        await deleteDoc(doc(zones_ben_col, document.id));
                    });
            
                    zone_benevole.forEach(async (intitule) => {
                        try {
                            if (intitule !==''){
                                await addDoc(zones_ben_col, {intitule});
                            }
                        } 
                        catch (error) {
                            console.error('Erreur lors de l\'ajout de la zone :', error);
                        }
                    });
            
                } catch (error) {
                    console.error('Erreur bdd :', error);
                }
                
                // zone plan
                try {
                    const zones_plan_col = collection(db, 'zone_plan');
                    const zones_plan_doc = await getDocs(zones_plan_col);
            
                    zones_plan_doc.forEach(async (document) => {
                        await deleteDoc(doc(zones_plan_col, document.id));
                    });
            
                    zone_plan.forEach(async (intitule) => {
                        try {
                            if (intitule !==''){await addDoc(zones_plan_col, {intitule});}
                        } catch (error) {
                            console.error('Erreur lors de l\'ajout de la zone :', error);
                        }
                    });
            
                } catch (error) {
                    console.error('Erreur bdd :', error);
                }

                // postes
                try {
                    const postes_col = collection(db, 'postes');
                    const postes_doc = await getDocs(postes_col);
            
                    postes_doc.forEach(async (document) => {
                        await deleteDoc(doc(postes_col, document.id));
                    });
            
                    inputLines.forEach(async (unposte) => {
                        try {
                            await addDoc(postes_col, unposte.data);
                        } catch (error) {
                            console.error('Erreur lors de l\'ajout du poste :', error);
                        }
                    });
            
                } catch (error) {
                    console.error('Erreur bdd :', error);
                }

                // créneaux horaire
                try {
                const creneaucol = collection(db, 'plage_horaire');
                const creneaudoc = await getDocs(creneaucol);
        
                creneaudoc.forEach(async (document) => {
                    await deleteDoc(doc(creneaucol, document.id));
                });
        
                joursfest.forEach(async (unjour) => {
                    try {
                        let cejour = new Date(unjour);
                        await addDoc(creneaucol,  { jour: joursDeLaSemaine[cejour.getDay()], horaire: "9h-11h"});
                        await addDoc(creneaucol,  { jour: joursDeLaSemaine[cejour.getDay()], horaire: "11h-14h"});
                        await addDoc(creneaucol,  { jour: joursDeLaSemaine[cejour.getDay()], horaire: "14h-17h"});
                        await addDoc(creneaucol,  { jour: joursDeLaSemaine[cejour.getDay()], horaire: "17h-20h"});
                        await addDoc(creneaucol,  { jour: joursDeLaSemaine[cejour.getDay()], horaire: "20h-22h"});
                    } catch (error) {
                        console.error('Erreur lors de l\'ajout des créneaux :', error);
                    }
                });
        
            } catch (error) {
                console.error('Erreur bdd :', error);
            }

            // crée le festival 
                const nvfestival = {
                    date_debut: datedebut,
                    date_fin: datefin,
                    annee: datedebut.getFullYear(),
                };
                
                // console.log(nvfestival);
                
                try {
                    const festival_col = collection(db, 'festival');
                    await addDoc(festival_col, nvfestival);
                    props.setFestival(nvfestival);
                } catch (error) {
                    console.error('Erreur lors de la création du festival :', error);
                }
            } 
            catch (error) {
                console.error('Erreur bdd :', error);
            }

            //   console.log('Festival créé !! Amuse toi bien')
            setVal(0);
        }
    }


    const [formData, setFormData] = useState({
        startDate: new Date(),
        endDate: new Date(),
    });

    // pour les input date
    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        create_festival();
    };

    const ajouterLigne = () => {
        setInputLines([...inputLines, { id: inputLines.length, data: { intitule: '', capacite: 1, desc: '', referent: '' } }]);
    };

    const supprimerLigne = (index) => {
        const nouvellesLignes = [...inputLines];
        nouvellesLignes.splice(index, 1);
        setInputLines(nouvellesLignes);
    };

  // pour les postes saisis
  const handleInputChange = (value, index, champ) => {
    const nouvellesLignes = [...inputLines];
    const ligneModifiee = { ...nouvellesLignes[index], data: { ...nouvellesLignes[index].data, [champ]: value } };
    nouvellesLignes[index] = ligneModifiee;
    setInputLines(nouvellesLignes);
  };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            const zones_ben = new Set();
            const zones_plan = new Set();
            reader.onload = (event) => {
                const csvData = event.target.result;
                const parsedData = parseCSVData(csvData);
                parsedData.forEach((item) => {
                    zones_ben.add(item.data.Zone_benevole);
                    zones_plan.add(item.data.Zone_plan);
                });
                setZone_benevole(zones_ben);
                setZone_plan(zones_plan);
                setJeux(parsedData);
                // console.log(jeux)
            };
            getDatesBetween();
            reader.readAsText(file);
        }
    };

  // recupère les données du csv
  const parseCSVData = (csvData) => {
    
    const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    
  
    if (results.errors.length > 0) {
      console.error('Erreur lors de l\'analyse CSV:', results.errors);
      setErreur("Erreur avec le fichier csv")
      return [];
    }
  
    const parsedData = results.data.map((row) => {
        return {
            data: {
                A_animer: row['À animer'],
                Auteur: row['Auteur'],
                Nb_joueurs: row['nb joueurs'],
                Age_min: row['âge min'],
                Duree: row['Durée'],
                Mecanismes: row['Mécanismes'],
                Themes: row['Thèmes'],
                Image: row['Image'],
                Editeur: row['Éditeur'],
                Nom_jeu: row["Nom du jeu"],
                Notice: row["Notice"],
                Recu : row['Reçu'],
                Type: row['Type'],
                Video: row['Vidéo'],
                Zone_benevole : row['Zone bénévole'],
                Zone_plan: row['Zone plan'] ,
            }
        };
    });
    
    return parsedData;
  };


    return (
        <div className='festivalView'>
            <form onSubmit={handleSubmit}>
                <div className='rowdate'>
                    <label>Date de début :</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className='rowdate'>
                    <label>Date de fin :</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <h3>Postes</h3>
                <div>
                    {inputLines.map((ligne, index) => (
                        <div className='newposte'>
                            <div className='column left'>
                                <div className='row'>
                                    <label> Intitulé du poste : </label>
                                    <input
                                        type="text"
                                        name='intitule'
                                        className='input acti'
                                        value={ligne.data.intitule}
                                        required
                                        onChange={(e) => handleInputChange(e.target.value, index, 'intitule')}
                                    />
                                </div>
                                <div className='row'>
                                    <label> Description : </label>
                                    <input
                                        type="text"
                                        className='desc '
                                        rows='2'
                                        name='desc'
                                        value={ligne.data.desc}
                                        required
                                        onChange={(e) => handleInputChange(e.target.value, index, 'desc')}
                                    />
                                </div>
                            </div>
                            <div className='column middle'>
                                <div className='row'>
                                    <label className='right'> Capacité : </label>
                                    <input
                                        type="number"
                                        className='input capa'
                                        name="capacite"
                                        max={50}
                                        min={1}
                                        pattern="\d{1,3}"
                                        value={ligne.data.capacite}
                                        required
                                        onKeyDown={(e) => e.preventDefault()}
                                        onChange={(e) => handleInputChange(e.target.value, index, 'capacite')}
                                    />
                                </div>  
                                <div className='row'>
                                    <label className='right'> Référent : 
                                        <select type="text" name="referent" value={ligne.data.referent} onChange={(e) => handleInputChange(e.target.value, index, 'referent')}>
                                            <option value="">Sélectionner</option>
                                            {listUser.map((row) => (
                                                <option key={row.id}  value={row.id}>{row.data.prenom} {row.data.nom}</option>
                                            ))}
                                        </select>
                                    </label>   
                                </div>
                            </div>
                            <div className='column right'>
                                <button 
                                    className='updateBtn btn' 
                                    onClick={() => supprimerLigne(index)}>
                                    -
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className='updateBtn btn' onClick={ajouterLigne}>+</button>
                </div>
                <h3 htmlFor="csvInput">Import CSV:</h3>
                <input
                    className='inputfile'
                    type="file"
                    id="csvInput"
                    accept=".csv"
                    required
                    onChange={handleFileChange}
                />
                <button className='updateBtn' type="submit">Soumettre</button>
                <p className='error'>{erreur}</p>
            </form>
        </div>
    );
}
