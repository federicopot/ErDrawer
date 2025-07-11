export async function showModalName(textNode, modelType, selectedEntities = []) {
    if (!Object.values(ModelTypes).includes(modelType)) {
        throw new Error("modelType non valido!");
    }
    switch (modelType) {
        case "ENTITY":
            const { value: testo } = await Swal.fire({
                title: "Scrivi il nuovo nome",
                input: "text",
                inputLabel: "Entità...",
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return "Devi scrivere qualcosa!";
                    }
                }
            });
            if (testo) {
                Swal.fire(`il nuovo nome: ${testo}`);
            }
            textNode.text(testo)
            break;

        case "ATTRIBUTE":
            const { value: formValues } = await Swal.fire({
                title: "Aggiungi attributo",
                html: `
                    <label>Nome attributo</label>
                    <input id="swal-input1" class="swal2-input" placeholder="es. id, nome">

                    <div style="margin-top:10px;">
                        <label>
                            <input type="checkbox" id="swal-input2">
                            È una primary key?
                        </label>
                    </div>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const inputName = document.getElementById("swal-input1").value;
                    const isPrimaryKey = document.getElementById("swal-input2").checked;
                    if (!inputName.trim()) {
                        Swal.showValidationMessage("Il nome dell'attributo è obbligatorio.");
                        return;
                    }
                    return [inputName, isPrimaryKey];
                }
            });

            if (formValues) {
                const [nomeAttributo, isPrimaryKey] = formValues;
                Swal.fire({
                    icon: "success",
                    title: "Attributo ricevuto",
                    html: `
                        <strong>Nome:</strong> ${nomeAttributo}<br>
                        <strong>Primary Key:</strong> ${isPrimaryKey ? "Sì" : "No"}
                    `
                });
                return formValues
            }
            break;

        case "RELATIONSHIP":
            function createCard(n) {
                return `
            <div style="margin-top:10px;">
                <label class="swal2-input">Cardinalità ${n + 1}</label>
                <input id="swal-input${n + 1}" type="text" placeholder="Cardinalità lato ${n + 1} (es. 1, N)"/>
            </div>
        `;
            }

            if (selectedEntities.length == 0) {
                return null;
            }

            let cards = "";
            selectedEntities.forEach((_, index) => {
                cards += createCard(index);
            });

            const inputCardinals = [];
            const { value: data } = await Swal.fire({
                title: "Crea associazione",
                html: `
            <label>Nome Associazione</label>
            <input id="swal-input0" class="swal2-input" placeholder="es. essere, associare...">
            ${cards}
        `,
                focusConfirm: false,
                preConfirm: () => {
                    const inputName = document.getElementById("swal-input0").value;

                    for (let i = 0; i < selectedEntities.length; i++) {
                        const val = document.querySelector(`#swal-input${i + 1}`).value;
                        if (checkCardinals(val)) {
                            inputCardinals.push(val);
                        } else {
                            Swal.showValidationMessage(`Cardinalità ${i + 1} non valida (es. 1, N)`);
                            return;
                        }
                    }

                    if (!inputName.trim()) {
                        Swal.showValidationMessage("Il nome per l'associazione è obbligatorio.");
                        return;
                    }

                    return [inputName, inputCardinals];
                }
            });

            if (data) {
                return data;
            }
            break;

        case "ISA":

            break;
        case "NONE":
            throw new Error("modelType none!");
            break
    }

}

export const ModelTypes = {
    ENTITY: "ENTITY",
    ATTRIBUTE: "ATTRIBUTE",
    RELATIONSHIP: "RELATIONSHIP",
    ISA: "ISA",
    NONE: "NONE",
    GENERAL: "GENERAL"
};


export function getConnectionPoint(entity, index, total) {
    const rect = entity.rect;
    const x = rect.x();
    const y = rect.y();
    const w = rect.width();
    const h = rect.height();
    const P = 2 * (w + h);
    const d = ((index + 1) * P) / (total + 1);

    let cx, cy;
    if (d <= w) {
        // Lato superiore
        cx = x + d;
        cy = y;
    } else if (d <= w + h) {
        // Lato destro
        cx = x + w;
        cy = y + (d - w);
    } else if (d <= 2 * w + h) {
        // Lato inferiore
        cx = x + w - (d - (w + h));
        cy = y + h;
    } else {
        // Lato sinistro
        cx = x;
        cy = y + h - (d - (2 * w + h));
    }
    return { x: cx, y: cy };
}
export function getConnectionPointRel(relation, index, total) {
    const rhombus = relation.rhombus;
    const cx = rhombus.x();
    const cy = rhombus.y();

    const r = rhombus.radius();
    const scaleY = rhombus.scaleY(); // ✅ Assicuriamoci che sia una funzione se serve
    const w = r * 2;
    const h = r * 2 * scaleY;

    const P = 2 * (w + h);
    const d = ((index + 1) * P) / (total + 1);

    let x, y;
    if (d <= w) {
        // Top
        x = cx - r + d;
        y = cy - r * scaleY;
    } else if (d <= w + h) {
        // Right
        x = cx + r;
        y = cy - r * scaleY + (d - w);
    } else if (d <= 2 * w + h) {
        // Bottom
        x = cx + r - (d - (w + h));
        y = cy + r * scaleY;
    } else {
        // Left
        x = cx - r;
        y = cy + r * scaleY - (d - (2 * w + h));
    }

    return { x, y };
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function getEdgePoint(entity, targetPoint) {
    const rect = entity.rect;
    const centerX = rect.x() + rect.width() / 2;
    const centerY = rect.y() + rect.height() / 2;
    const dx = targetPoint.x - centerX;
    const dy = targetPoint.y - centerY;
    const ratio = Math.abs(dx / dy);
    const halfWidth = rect.width() / 2;
    const halfHeight = rect.height() / 2;
    if (ratio > halfWidth / halfHeight) {
        const signX = dx > 0 ? 1 : -1;
        return {
            x: centerX + signX * halfWidth,
            y: centerY + (dy * halfWidth) / Math.abs(dx),
        };
    } else {
        const signY = dy > 0 ? 1 : -1;
        return {
            x: centerX + (dx * halfHeight) / Math.abs(dy),
            y: centerY + signY * halfHeight,
        };
    }
}

export function checkCardinals(card) {
    const parts = card.split(",");
    if (parts.length !== 2) return false;
    const cMin = parts[0].trim().toUpperCase();
    const cMax = parts[1].trim().toUpperCase();
    const isValidValue = (val) => {
        if (val === "N") return true;
        return /^(0|[1-9]\d*)$/.test(val);
    };
    if (!isValidValue(cMin) || !isValidValue(cMax)) return false;
    const numMin = cMin === "N" ? Infinity : parseInt(cMin, 10);
    const numMax = cMax === "N" ? Infinity : parseInt(cMax, 10);
    // Impedisci valori totalmente illogici (ad es. 0,0 o N,N)
    if ((cMin === "0" && cMax === "0") || (cMin === "N" && cMax === "N")) return false;
    if (numMin > numMax) return false;
    if (cMin === "N" && cMax !== "N") return false;
    return true;
}

function getLineIntersection(p1, p2, p3, p4) {
    const denom =
        (p1.x - p2.x) * (p3.y - p4.y) -
        (p1.y - p2.y) * (p3.x - p4.x);

    if (denom === 0) return null;

    const px =
        ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) -
         (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;

    const py =
        ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) -
         (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;

    // check if px, py is on both segments
    if (
        px < Math.min(p1.x, p2.x) - 0.01 || px > Math.max(p1.x, p2.x) + 0.01 ||
        px < Math.min(p3.x, p4.x) - 0.01 || px > Math.max(p3.x, p4.x) + 0.01 ||
        py < Math.min(p1.y, p2.y) - 0.01 || py > Math.max(p1.y, p2.y) + 0.01 ||
        py < Math.min(p3.y, p4.y) - 0.01 || py > Math.max(p3.y, p4.y) + 0.01
    ) {
        return null;
    }

    return { x: px, y: py };
}

export function getRhombusIntersection(cx, cy, points, targetX, targetY) {
    const center = { x: cx, y: cy };
    const target = { x: targetX, y: targetY };

    for (let i = 0; i < 4; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % 4];

        const intersect = getLineIntersection(center, target, p1, p2);
        if (intersect) return intersect;
    }

    return { x: cx, y: cy }; // fallback
}
