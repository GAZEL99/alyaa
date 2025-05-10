const fs = require('fs');
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@adiwajshing/baileys');

module.exports = {
    delayjpm: 4000, // Delay 4 detik antar pengiriman
    
    async sendJPM(conn, m, text) {
        if (!text && !m.quoted) throw "Silakan berikan teks atau reply pesan yang ingin dipromosikan";
        
        const teks = m.quoted ? m.quoted.text : text;
        const groups = await conn.groupFetchAllParticipating();
        const groupIDs = Object.keys(groups);
        let success = 0;
        
        for (const id of groupIDs) {
            try {
                await conn.sendMessage(id, { text: teks });
                success++;
                await new Promise(resolve => setTimeout(resolve, this.delayjpm));
            } catch (e) {
                console.error(`Gagal mengirim ke ${id}:`, e);
            }
        }
        
        return { total: groupIDs.length, success };
    },
    
    async sendJPMSlide(conn, m) {
        const teks = fs.readFileSync('./database/teksjpm.js', 'utf-8').replace('module.exports = `', '').replace('`', '');
        const groups = await conn.groupFetchAllParticipating();
        const groupIDs = Object.keys(groups);
        let success = 0;
        
        const img = await prepareWAMessageMedia(
            { image: fs.readFileSync('./media/thumbnail.jpg') },
            { upload: conn.waUploadToServer }
        );

        const msg = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: { text: teks },
                        footer: { text: "© " + global.namabot },
                        header: { 
                            hasMediaAttachment: true,
                            ...img
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Hubungi Owner",
                                    url: `https://wa.me/${global.owner}`,
                                    merchant_url: "https://google.com"
                                })
                            }]
                        }
                    }
                }
            }
        };

        for (const id of groupIDs) {
            try {
                await conn.relayMessage(id, msg, {});
                success++;
                await new Promise(resolve => setTimeout(resolve, this.delayjpm));
            } catch (e) {
                console.error(`Gagal mengirim slide ke ${id}:`, e);
            }
        }
        
        return { total: groupIDs.length, success };
    },
    
    setJPMText(text) {
        fs.writeFileSync('./database/teksjpm.js', `module.exports = \`${text}\`;`);
    },
    
    getJPMText() {
        return fs.readFileSync('./database/teksjpm.js', 'utf-8');
    }
};