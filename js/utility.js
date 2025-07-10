export async function showModalName(textNode, modelType) {
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