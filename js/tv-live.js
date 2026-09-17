/* =====================================================
   EUROPE LIVE — CHANNELS
===================================================== */

const tvChannels = [

    {
        id: "parliament",
        title: "European Parliament Live",
        channel: "European Parliament",
        channelId: "UCvU4p_w08osQsrNi_I4ZtDA",
        category: "EUROPE",
        priority: 1
    },

    {
        id: "commission",
        title: "European Commission Live",
        channel: "European Commission",
        channelId: "UCMPaviJxybo1RTdzvYcU91A",
        category: "EUROPE",
        priority: 2
    },

    {
        id: "euronews",
        title: "Euronews Live",
        channel: "Euronews",
        channelId: "UCSrZ3UV4jOidv8ppoVuvW9Q",
        category: "NEWS",
        priority: 3
    },

    {
        id: "tech",
        title: "European Technology Live",
        channel: "Tech Europe",
        channelId: "UCRw_6H2yFAjUY5mo3AvJT-A",
        category: "TECH",
        priority: 4
    }

];


/* =====================================================
   EUROPE LIVE — TV PROGRAMMING
===================================================== */

const tvSchedule = {

    morning: [

        {
            start: "08:00",
            programId: "parliament"
        },

        {
            start: "10:00",
            programId: "commission"
        },

        {
            start: "12:00",
            programId: "euronews"
        }

    ],


    afternoon: [

        {
            start: "14:00",
            programId: "parliament"
        },

        {
            start: "16:00",
            programId: "tech"
        },

        {
            start: "18:00",
            programId: "euronews"
        }

    ],


    night: [

        {
            start: "20:00",
            programId: "euronews"
        },

        {
            start: "22:00",
            programId: "parliament"
        }

    ]

};


/* =====================================================
   GET ALL SCHEDULED PROGRAMS
===================================================== */

function getAllScheduleEntries() {

    return [

        ...tvSchedule.morning,

        ...tvSchedule.afternoon,

        ...tvSchedule.night

    ];

}


/* =====================================================
   FIND CHANNEL
===================================================== */

function getChannelById(id) {

    return tvChannels.find(
        channel =>
            channel.id === id
    );

}


