module.exports = class BotReply{
    constructor(){

    }

    process(evt){
        let message = evt.message.text.toLowerCase().trim();
        this.tokens = message.split(' ');
        this.tokenAnalyse = {
            'hai': ' Hai 😊',
            'hi': ' Hai 😊',
            'hai abam': ' Hai 😊',
            'hai bam': ' Hai 😊',
            'hai abraham': ' Hai 😊',
            'hi abraham': ' Hai 😊',
            'hi abam': ' Hai 😊',
            'hi bam': ' Hai 😊',
            'siapa kamu?' : 'Aku asistennya abam 😊',
            'ini abam?' : 'Asistennya aja kok 😊',
            'mana abam?' : 'Abam lagi sibuk 😭',
            'lagi ngapain?' : 'Lagi buatin jadwal nih buat kamu 😊',
            'lagi apa?' : 'Lagi buatin jadwal nih buat kamu 😊',
            'oke' : '❤',
            'oke bam' : '❤',
            'ok' : '❤',
            'ok bam' : '❤',
            'thank you' : '❤',
            'thanks' : '❤',
            'thank you bam' : '❤',
            'makasih' : '❤',
            'makasih bam' : '❤',
            'makasi' : '❤',
            'makasi' : '❤',
            'abam jadwal' : 'botReplyJadwal',
            'besok ada tugas apa?' : 'botReplyJadwal',
            'besok ada pr?' : 'botReplyJadwal',
            'besok ada apa?' : 'botReplyJadwal',
            'besok ada tugas apa' : 'botReplyJadwal',
            'besok ada pr' : 'botReplyJadwal',
            'besok ada apa' : 'botReplyJadwal'
        }
        
        return this.tokenAnalyse[message] || null;
    }

    analyseSimilarity(){

    }

}