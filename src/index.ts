import { lookup } from "node:dns/promises";
import { networkInterfaces } from "node:os";
import { readdir, readFile } from "node:fs/promises";
import { exec } from "node:child_process";
import { join } from "node:path";
import cron from "node-cron";

const check = async () => {
    try {
        let ip = null;
        const interfaces = networkInterfaces();

        all:
        for (let i in interfaces) {
            const inf = interfaces[i];
            if (!inf) continue;
            for (let item of inf) {
                if (item.family === "IPv4" && !item.internal) {
                    ip = item.address;
                    break all;
                }
            }
        }

        const check = await lookup("one.one.one.one", {
            family: 4
        });
        if (check.family === 4 && check.address === "1.1.1.1") {
            return "dns";
        }
        return "ip";
    } catch (e) {
        return "none";
    }
}

const NMCLI_DIR = "/etc/NetworkManager/system-connections";
const findWifi = async (): Promise<string[]> => {
    try {
        const files = await readdir(NMCLI_DIR, { encoding: "utf8" });
        const items = await Promise.all(files.map(it => readFile(join(NMCLI_DIR, it), { encoding: 'utf8' })));
        
        const extracted = items.map(it => {
            const lines = it.split("\n");
            let id;
            let pri = 0;
            for (let line of lines) {
                const [ key, value ] = line.split("=");
                if (key === "id") id = value;
                if (key === "autoconnect-priority") pri = parseInt(value);
                if (key === "type" && value !== "wifi") return null;
            }
            if (id) return [ id, pri ] as [ string, number ];
            return null;
        }).filter(it => it !== null).sort((a, b) => b[1] - a[1]).map(it => it[0]);

        return extracted;
    } catch (e) {
        return [];
    }
}

const connect = async (id: string) => {
    return new Promise((resolve, reject) => {
        const process = exec(`nmcli c up ${id}`, (error, stdout, stderr) => {
            if (error) {
                reject([ stdout, stderr ]);
            } else {
                resolve([ stdout, stderr ]);
            }
        });
    })
}

const reboot = () => {
    return new Promise((resolve, reject) => {
        const process = exec(`reboot`, (error, stdout, stderr) => {
            if (error) {
                reject([ stdout, stderr ]);
            } else {
                resolve([ stdout, stderr ]);
            }
        });
    })
}

let failed = 0;
let failedDns = 0;

const c = async () => {
    switch (await check()) {
        case "dns": {
            failed = 0;
            failedDns = 0;
            return true;
        }
        case "ip": {
            failed = 0;
            return true;
        }
        case "none": {
            return false;
        }
    }
}

findWifi().then(nets => {
    console.log("Found Networks on Startup:");
    console.log(nets.join("\n"));
}).catch(e => { console.error("Network Check Failed:"); console.error(e); });

const task = cron.schedule("* * * * *", async () => {
    const attempt = await check();
    if (attempt === "dns") {
        failed = 0;
        failedDns = 0;
        return;
    }
    if (attempt === "ip" && failedDns > 15) {
        await reboot();
        return;
    }
    if (attempt === "ip") {
        failedDns ++;
        return;
    }
    failed ++;
    failedDns = 0;
    const networks = await findWifi();
    for (let net of networks) {
        await connect(net);
        if (await c()) return;
    }
    if (failed > 15) {
        await reboot();
    }
}, {
    noOverlap: true,
});