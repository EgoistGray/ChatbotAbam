module.exports = class BotReply {
    constructor() {

    }

    process(evt) {
        let message = evt.message.text.toLowerCase().trim();
        console.log(message , 1);
        this.tokens = message.split(' ');
        this.tugasToken = /tugas|pr|jadwal/g;
        this.questionToken = /besok|ada|apa/g;
        this.group = {
            'abam jadwal': 'botReplyJadwal',
            'besok ada tugas ga?': 'botReplyJadwal',
            'besok ada tugas ga': 'botReplyJadwal',
            'besok ada pr ga?': 'botReplyJadwal',
            'besok ada pr ga': 'botReplyJadwal',
            'besok ada tugas apa?': 'botReplyJadwal',
            'besok ada tugas apa': 'botReplyJadwal',
            'besok ada tugas?': 'botReplyJadwal',
            'besok ada tugas': 'botReplyJadwal',
            'besok ada pr?': 'botReplyJadwal',
            'besok ada pr': 'botReplyJadwal',
            'ada tugas ga?': 'botReplyJadwal',
            'ada tugas ga': 'botReplyJadwal',
            'ada tugas apa': 'botReplyJadwal',
            'ada tugas apa?': 'botReplyJadwal',
            'ada tugas gak?': 'botReplyJadwal',
            'ada tugas nggak?': 'botReplyJadwal',
            'ada tugas nggak': 'botReplyJadwal',
            'besok ada apa?': 'botReplyJadwal',
            'besok ada apa': 'botReplyJadwal',
            'besok ada tugas apa': 'botReplyJadwal',
            'besok ada pr': 'botReplyJadwal',
            'tugas?': 'botReplyJadwal',
            'besok ada apa': 'botReplyJadwal',
        }
        this.tokenAnalyse = {
            'hai': ' Hai 😊',
            'hi': ' Hai 😊',
            'halo': ' Hai 😊',
            'hello': ' Hai 😊',
            'hai abam': ' Hai 😊',  
            'hai bam': ' Hai 😊',
            'hai abraham': ' Hai 😊',
            'hi abraham': ' Hai 😊',
            'hi abam': ' Hai 😊',
            'hi bam': ' Hai 😊',
            'hello abraham': ' Hai 😊',
            'hello abam': ' Hai 😊',
            'hello bam': ' Hai 😊',
            'halo abraham': ' Hai 😊',
            'halo abam': ' Hai 😊',
            'halo bam': ' Hai 😊',
            'siapa kamu?': 'Aku asistennya abam 😊',
            'ini abam?': 'Asistennya aja kok 😊',
            'mana abam?': 'Abam lagi sibuk 😭',
            'lagi ngapain?': 'Lagi buatin jadwal nih buat kamu 😊',
            'lagi apa?': 'Lagi buatin jadwal nih buat kamu 😊',
            'oke': '❤',
            'oke bam': '❤',
            'ok': '❤',
            'ok bam': '❤',
            'thank you': '❤',
            'thanks': '❤',
            'thank you bam': '❤',
            'makasih bam': '❤',
            'makasi': '❤',
            "abam jelek" : "iya ya dia jelek",
            "bam jelek" : "ish parah",
            
        }

        // If this is a group chat
        // if (evt.source.groupId) {
        //     return this.group[message] || null;
        // };

        if(this.tugasToken.test(message) && this.questionToken.test(message)){
            return 'botReplyJadwal';
        };

        return this.tokenAnalyse[message] || this.group[message] || null;

    }

}