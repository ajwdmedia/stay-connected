import { lookup } from "node:dns/promises";
import { networkInterfaces } from "node:os";
import { writeFile, readdir } from "node:fs/promises";
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

const wifi = async () => {
    const files = await readdir("/etc/NetworkManager/system-connections", { encoding: "utf8" });
    
}