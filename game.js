// const sheetId = '14mraaw3xN0j05MHLDuyHS6e1md2idLvAjon-bbNLB1k'; // <-- Replace with your actual Sheet ID
// const gid = '1245418635'; // <-- Replace with your actual GID if not 0

// let url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
// url = url.replace(/&/g, '%26'); // Encode '&' to avoid issues in URL

// // To fetch data from multiple sheets in one spreadsheet, you need to repeat the fetch for each sheet's GID.
// // Example: Suppose you have an array of GIDs for each sheet you want to fetch.

// const sheetGIDs = [
//     '1245418635', // Naming ID
//     '0', // Main MCQ database
//     '1180154', // SAQ database for main problem
//     '9691453620', // SAQ database for subproblems
//     '2041757623' // data importer
//     // Add more GIDs as needed
// ];

// sheetGIDs.forEach(gid => {
//     let sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
//     sheetUrl = sheetUrl.replace(/&/g, '%26');
//     fetch(sheetUrl)
//         .then(response => response.text())
//         .then(text => {
//             const json = JSON.parse(text.slice(47, -2));
//             json.table.rows.forEach(row => {
//                 const rowData = row.c.map(cell => cell ? cell.v : "");
//                 console.log(`Sheet GID ${gid}:`, rowData);
//             });
//         })
//         .catch(error => {
//             console.error(`Error fetching Google Sheet GID ${gid}:`, error);
//         });
// });

const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById("questionCounter");
const scoreText = document.getElementById("score");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const explanationBtn = document.getElementById("explanationBtn");

let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

const predefinedCodesMap = {
    // Year 1
    "BASIC PSYCHIATRY": "BAPSY",
    "EMBRYOLOGY": "EMBRY",
    "BIOCHEMISTRY": "BIOCH",
    "GEN1": "GEN01", // Using 01 for 2 digits to keep consistent 5-char
    "GEN2": "GEN02",
    "GEN3": "GEN03",
    "GEN4": "GEN04",
    "HUMAN & HEALTH": "HUMHE",
    "SUPPLEMENTARY SUBJECT": "SUPPS",

    // Year 2
    "GEN5": "GEN05",
    "MUSCULOSKELETAL": "MUSCS",
    "SKIN": "SKINX", // Padded to 5 chars
    "HEMATOLOGY": "HEMTO",
    "ENDOCRINE": "ENDOC",
    "GASTROINTESTINAL": "GASTR",
    "NEURON SYSTEM": "NEURO",
    "COMMED": "COMMD",
    "ENGLISH FOR MEDICAL PURPOSE 1": "EFMP1",

    // Year 3
    "CARDIOVASCULAR SYSTEM": "CARDI",
    "RESPIRATORY SYSTEM": "RESPY",
    "REPRODUCTIVE SYSTEM": "REPRO", // Distinct from RESPY
    "CLINICAL CORRELATION": "CLCOR",
    "COMPREHENSIVE 1": "COMP1",
    "NLE STEP 1": "NLE01",

    // Year 4
    "MEDICAL RESEARCH 1": "MEDR1",
    "INTERNAL MEDICINE": "INTMD", // Base for IM
    "OBSTETRICIAN-GYNECOLOGIST": "OBGYN",
    "PEDIATRICS": "PEDIA",
    "SURGERY 1": "SURG1",
    "EAR, NOSE, AND THROAT": "ENTXX", // Common abbreviation, padded
    "PHYSICAL MEDICINE AND REHABILITATION": "PHMRE",
    "COMMED&OCCMED": "CMOCM",
    "FORENSIC MEDICINE 1": "FORM1",

    // Year 5
    "ANESTHESIOLOGY": "ANEST",
    "FORENSIC MEDICINE 2": "FORM2",
    "CLINICAL RADIOLOGY": "CLRDA",
    "ORTHOPEDICS 1": "ORTH1",
    "SURGERY 2": "SURG2",
    "OPHTHALMOLOGY": "OPHTL",
    "PSYCHIATRY": "PSYC2", // Differentiate from Year 1 Psychiatry
    "INTERNAL MEDICINE 2": "INTM2",
    "AMBULATORY CARE 1": "AMBC1",
    "COMMUNITY MEDICINE AND FAMILY MEDICINE": "COFAM",
    "EMERGENCY MEDICINE 1": "EMGM1",
    "MEDICAL RESEARCH 2": "MEDR2",
    "NLE STEP 2": "NLE02",
    "COMPREHENSIVE 2": "COMP2",

    // Year 6
    "INTERNAL MEDICINE 3": "INTM3",
    "SURGERY 3": "SURG3",
    "PEDIATRIC 3": "PEDI3",
    "OBGYN 3": "OBGYN3",
    "ORTHOPEDICS 2": "ORTH2",
    "EMERGENCY MEDICINE 2": "EMGM2",
    "NLE STEP 3": "NLE03"
};

// Array of full subject names
const subjectsByYear = {
    "1": [
        "Basic Psychiatry",
        "Embryology",
        "Biochemistry",
        "GEN1",
        "GEN2",
        "GEN3",
        "GEN4",
        "Human & Health",
        "Supplementary subject"
    ],
    "2": [
        "GEN5",
        "Musculoskeletal",
        "Skin",
        "Hematology",
        "Endocrine",
        "Gastrointestinal",
        "Neuron system",
        "COMMED",
        "English for Medical Purpose 1"
    ],
    "3": [
        "Cardiovascular system",
        "Respiratory system",
        "Reproductive system",
        "Clinical correlation",
        "Comprehensive 1",
        "NLE step 1"
    ],
    "4": [
        "Medical Research 1",
        "Internal medicine",
        "Obstetrician-Gynecologist",
        "Pediatrics",
        "Surgery 1",
        "Ear, Nose, and Throat",
        "Physical Medicine and Rehabilitation",
        "COMMED&OCCMED",
        "Forensic medicine 1"
    ],
    "5": [
        "Anesthesiology",
        "Forensic medicine 2",
        "Clinical radiology",
        "orthopedics 1",
        "surgery 2",
        "ophthalmology",
        "Psychiatry", // Duplicate subject name, mapped to PSYCH2 in predef
        "Internal medicine 2",
        "Ambulatory care 1",
        "Community medicine and Family medicine",
        "Emergency medicine 1",
        "Medical research 2",
        "NLE step 2",
        "Comprehensive 2"
    ],
    "6": [
        "Internal medicine 3",
        "Surgery 3",
        "Pediatric 3",
        "OBGYN 3",
        "orthopedics 2",
        "emergency medicine 2",
        "NLE step 3"
    ]
};

// Array of 5-letter subject abbreviations (derived from the full names)
// NOTE: Collisions handled where possible, but review for your exact preferences.
const subjectAbbreviations = [
    "BAPSY",   // Basic Psychiatry
    "EMBRO",   // Embryology
    "BIOCH",   // Biochemistry
    "GEN1X",   // GEN1 (padded)
    "GEN2X",   // GEN2 (padded)
    "GEN3X",   // GEN3 (padded)
    "GEN4X",   // GEN4 (padded)
    "HUMAH",   // Human & Health
    "SUBSU",   // Supplementary subject
    "GEN5X",   // GEN5 (padded)
    "MUSCS",   // Musculoskeletal
    "SKINX",   // Skin (padded)
    "HEMAT",   // Hematology
    "ENDOC",   // Endocrine
    "GASTR",   // Gastrointestinal
    "NEURO",   // Neuron system
    "COMMX",   // COMMED (Assuming you want COMMX for 5 letters for COMMED)
    "EFMP1",   // English for Medical Purpose 1 (keeping the 1)
    "CARDS",   // Cardiovascular system
    "RESPY",   // Respiratory system
    "REPRY",   // Reproductive system (collision with RESPY resolved)
    "CLINC",   // Clinical correlation
    "COMP1",   // Comprehensive 1
    "NLEST",   // NLE step 1 (can clash with NLE step 2/3 if not careful, see below)
    "MEDR1",   // Medical Research 1
    "INTER",   // Internal medicine
    "OBGYN",   // Obstetrician-Gynecologist
    "PEDIA",   // Pediatrics
    "SURG1",   // Surgery 1
    "ENOSE",   // Ear, Nose, and Throat
    "PMREH",   // Physical Medicine and Rehabilitation
    "COMOC",   // COMMED&OCCMED (COmmed OCCmed - A manual decision)
    "FORE1",   // Forensic medicine 1 (Differentiating from FM2)
    "ANEST",   // Anesthesiology
    "FORE2",   // Forensic medicine 2
    "CLINR",   // Clinical radiology
    "ORTH1",   // orthopedics 1
    "SURG2",   // surgery 2
    "OPHTH",   // ophthalmology
    "PSYCH",   // Psychiatry (second instance)
    "INTE2",   // Internal medicine 2
    "AMBU1",   // Ambulatory care 1
    "CMFME",   // Community medicine and Family medicine
    "EMER1",   // Emergency medicine 1 (Differentiating from EM2)
    "MEDR2",   // Medical research 2
    "NLE2X",   // NLE step 2 (Specific override to differentiate)
    "COMP2",   // Comprehensive 2
    "INTE3",   // Internal medicine 3
    "SURG3",   // Surgery 3
    "PEDI3",   // Pediatric 3 (Differentiating from PEDIA)
    "OBGY3",   // OBGYN 3 (Differentiating from OBGYN)
    "ORTH2",   // orthopedics 2
    "EMER2",   // emergency medicine 2
    "NLE3X"    // NLE step 3 (Specific override to differentiate)
];

let questions = [
    {
        // question_id: "1EMBR53001" 
        /*
        question_id comes from the database in format as following:
        1 : Medical year. In this case, it is "1" which stands for the first year of medical school.
        EMBRY : subject code name. In this case, it is "EMBRY" which stands for "Embryology".
        53 : Generation number. In this case, it is "53" which stands for the 53rd generation of questions.
        001 : Question number. In this case, it is "001" which stands for the first question of the 53rd generation.
        */
        question_id : "1LITE53001",
        question: "What is the capital of France?",
        choice1: "Paris",
        choice2: "London",
        choice3: "Berlin",
        choice4: "Madrid",
        choice5: "Rome",
        answer: 1,
        explanation: "Paris is the capital city of France, known for its art, fashion, and culture.",
        explanation_link: "https://drive.google.com/file/d/17MtcnQDsI_uPtxUuZOUJs27iaTY2rNhu/view?usp=sharing",
    },
    {
        question_id : "1ASTR53002",
        question: "What is the largest planet in our solar system?",
        choice1: "Earth",
        choice2: "Mars",
        choice3: "Jupiter",
        choice4: "Saturn",
        choice5: "Venus",
        answer: 3,
        explanation: "Jupiter is the largest planet in our solar system, with a diameter of about 86,881 miles (139,822 kilometers).",
        explanation_link: ""
    }
];

// constants
const CORRECT_BONUS = 10;
let MAX_QUESTIONS = 0;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [ ... questions];
    console.log(availableQuestions);
    MAX_QUESTIONS = availableQuestions.length;
    getNewQuestion();
};

getNewQuestion = () => {

    if(availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS){
        // go to the end page
        return window.location.assign("/end.html");
    }
    questionCounter++;
    questionCounterText.innerText = `${questionCounter + "/" + MAX_QUESTIONS}`;
    
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    console.log(availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion["choice" + number];
    });
    console.log(questionIndex);
    availableQuestions.splice(questionIndex, 1);
    console.log(availableQuestions);
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        const actualAnswer = currentQuestion.answer;

        if(selectedAnswer == currentQuestion.answer){
            scoreText.innerText = ++score;
            selectedChoice.parentElement.classList.add("correct");
        }
        else{
            selectedChoice.parentElement.classList.add("incorrect");
            choices.forEach(c => {
                if (c.dataset['number'] == actualAnswer) {
                    c.parentElement.classList.add("answer"); 
                }
            });
        }
        
        nextQuestionBtn.style.display = 'block';

        nextQuestionBtn.removeEventListener('click', handleNextButtonClick); 
        nextQuestionBtn.addEventListener('click', handleNextButtonClick);

        explanationBtn.style.display = 'block';
    }); 
});

const explanationText = document.getElementById("explanationText");
let showExplanation = false;

// Show explanation when explanationBtn is clicked
explanationBtn.addEventListener('click', () => {
    if (currentQuestion.explanation || currentQuestion.explanation_picture) {
        if(currentQuestion.explanation){
            explanationText.innerText = currentQuestion.explanation;
        }
        if(currentQuestion.explanation_link){ 
            const url = currentQuestion.explanation_link;
            if (!url) return;
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.endsWith('.pdf')) {
                explanationText.innerHTML += `<br><iframe src="${url}" style="width:100%;height:500px;" frameborder="0"></iframe>`;
            } else if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
                explanationText.innerHTML += `<br><img src="${url}" alt="Explanation Image" style="max-width: 100%; height: auto;">`;
            } else if (lowerUrl.startsWith('http')) {
                explanationText.innerHTML += `<br><a href="${url}" target="_blank" rel="noopener">View Explanation File</a>`;
            } else {
                explanationText.innerHTML += `<br><span>Explanation file: <a href="${url}" target="_blank" rel="noopener">${url}</a></span>`;
            }
        }
    } 
    else {
        explanationText.innerText = "No explanation available.";
    }

    if(!showExplanation){
        explanationText.classList.add('show');
        showExplanation = true;
    }
    else{
        explanationText.classList.remove('show');
        showExplanation = false;   
    }

    explanationText.style.display = 'block';

});

function handleNextButtonClick() {
    nextQuestionBtn.style.display = 'none';
    explanationBtn.style.display = 'none';
    explanationText.style.display = 'none';
    if(showExplanation){
        explanationText.classList.remove('show');
        showExplanation = false;
    }
    choices.forEach(choiceElement => {
        choiceElement.parentElement.classList.remove('correct', 'incorrect', 'answer');
    });

    getNewQuestion();
}

startGame();
