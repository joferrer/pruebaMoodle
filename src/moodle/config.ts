// @ts-ignore
import lti from 'ims-lti'


// Cambia esto por lo que pongas en Moodle
const CONSUMER_KEY = 'mi-clave';
const CONSUMER_SECRET = 'mi-secreto';

const outcome = new lti.OutcomeService({
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    service_url: req.body.url,
    source_did: req.body.sourcedid
});


interface SendGradeProps {
    grade: number,
    
}
const sendGrade = ({}) => {

    outcome.send_replace_result('0.85', (err, result) => {
        if (err) {
            return res.status(500).send('Error enviando calificación');
        }
        res.send('✅ Calificación enviada correctamente');
    });
}

export const ltiProvider = new lti.Provider(CONSUMER_KEY, CONSUMER_SECRET);