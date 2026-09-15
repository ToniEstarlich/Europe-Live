/* =====================================================
   EUROPE LIVE — TV ENGINE
===================================================== */

let currentProgramIndex = 0;
let currentProgram = null;


/* =====================================================
   SORT PROGRAMS
===================================================== */

function getSortedPrograms() {

    return [...tvPrograms].sort(
        (a, b) =>
            a.priority - b.priority
    );

}


/* =====================================================
   GET CURRENT PROGRAM
===================================================== */

function getCurrentProgram() {

    const programs =
        getSortedPrograms();

    if (
        programs.length === 0
    ) {
        return null;
    }

    return programs[
        currentProgramIndex
    ];

}


/* =====================================================
   GET NEXT PROGRAM
===================================================== */

function getNextProgram() {

    const programs =
        getSortedPrograms();

    if (
        programs.length === 0
    ) {
        return null;
    }

    const nextIndex =
        (
            currentProgramIndex + 1
        ) % programs.length;

    return programs[nextIndex];

}


/* =====================================================
   UPDATE TV INFO
===================================================== */

function updateTVInfo(program) {

    const nowTitle =
        document.querySelector(
            ".tv-now-title"
        );

    const nowChannel =
        document.querySelector(
            ".tv-now-channel"
        );

    const nextTitle =
        document.querySelector(
            ".tv-next-title"
        );


    if (nowTitle) {

        nowTitle.textContent =
            program
                ? program.title
                : "No program";

    }


    if (nowChannel) {

        nowChannel.textContent =
            program
                ? program.channel
                : "";

    }


    const nextProgram =
        getNextProgram();


    if (nextTitle) {

        nextTitle.textContent =
            nextProgram
                ? nextProgram.title
                : "No program";

    }

}


/* =====================================================
   PLAY CURRENT PROGRAM
===================================================== */

function playCurrentProgram() {

    const programs =
        getSortedPrograms();

    if (
        programs.length === 0
    ) {

        console.warn(
            "Europe Live: No TV programs configured."
        );

        return;
    }


    currentProgram =
        programs[
            currentProgramIndex
        ];


    console.log(
        "Europe Live NOW:",
        currentProgram.title
    );


    updateTVInfo(
        currentProgram
    );


    playProgram(
        currentProgram,
        () => {

            playNextProgram();

        }
    );

}


/* =====================================================
   PLAY NEXT PROGRAM
===================================================== */

function playNextProgram() {

    const programs =
        getSortedPrograms();

    if (
        programs.length === 0
    ) {
        return;
    }


    currentProgramIndex =
        (
            currentProgramIndex + 1
        ) % programs.length;


    currentProgram =
        programs[
            currentProgramIndex
        ];


    console.log(
        "Europe Live NEXT → NOW:",
        currentProgram.title
    );


    playCurrentProgram();

}


/* =====================================================
   START TV ENGINE
===================================================== */

function initTVEngine() {

    console.log(
        "Europe Live TV Engine starting..."
    );


    currentProgramIndex = 0;

    playCurrentProgram();

}
