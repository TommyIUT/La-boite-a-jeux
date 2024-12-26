import React,{ useEffect } from 'react';

import './planningView.css';

export default function PlanningView(props){
    useEffect(() => {
    },[]);

    const jours = props.jours;
    const zones = props.zones;
    const plages = props.plages;
    const postes = props.postes;
    const actualUser = props.actualUser;
    const isRegisteredPoste = props.isRegisteredPoste; 
    const isRegisteredZone = props.isRegisteredZone;

    return(
        <div className='planningView'>
            <h1>Planning Personnel</h1>
            <div className='planning'>
                {jours && postes && zones && plages && (
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
                                        <td key={plage.id}>
                                            {isRegisteredPoste(actualUser.id, plage.id, unposte.data.intitule) && (
                                                <button className='travaille'>Travaille</button>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table> 
                )}

                {jours && postes && zones && plages && (
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
                                {jours.map((unjour, index) => (
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
                                {plages.map((plage, inedx) => (                                
                                    <td key={plage.id}>
                                        {isRegisteredZone(actualUser.id, plage.id, unezone.data.intitule) && (
                                            <button className='travaille'>Travail</button>
                                        )}
                                    </td>
                                ))}
                            </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}