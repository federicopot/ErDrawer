/*
██╗███████╗       █████╗    
██║██╔════╝      ██╔══██╗    
██║███████╗█████╗███████║    
██║╚════██║╚════╝██╔══██║    
██║███████║      ██║  ██║    
╚═╝╚══════╝      ╚═╝  ╚═╝    
*/

import { entities, isaRelations, layer, setIsaChildren, setIsaMode, stage } from "./app.js";
import { createEntity } from "./entity.js";

export function createISA() {
    if (entities.length < 1) {

        Swal.fire({
            "title": "Errore",
            "text": "Devono esserci prima 2 entità",
            "icon": "warning"
        })
        return;
    }
    setIsaMode(true)
    let isaParent = null;
    setIsaChildren([])
    Swal.fire({
        "title": "Creazione IS-A",
        "text": "Seleziona un'entità padre",
        "icon": "info"
    })

    const handler = (e) => {
        const target = entities.find((entity) => entity.rect === e.target);
        if (target) {
            isaParent = target;

            target.rect.stroke("#4CAF50");

            showISAModal(isaParent);

            stage.off("click tap", handler);
            layer.batchDraw();
        }
    };

    stage.on("click tap", handler);
}

function showISAModal(parent) {
    const modal = document.getElementById("isaModal");
    const inputs = modal.querySelector(".isa-inputs");
    inputs.innerHTML =
        '<input type="text" placeholder="Nome figlio 1" required> <input type="text" placeholder="Nome figlio 2" required autocomplete="off">';
    modal.classList.add("active");

    document.getElementById("addChildBtn").onclick = () => {
        if (modal.querySelectorAll("input").length < 5) {
            const newInput = document.createElement("input");
            newInput.type = "text";
            newInput.autocomplete = "off";
            newInput.placeholder = `Nome figlio ${inputs.children.length + 1}`;
            newInput.required = true;
            inputs.appendChild(newInput);
        } else {
            Swal.fire({
                "title": "Errore",
                "text": "Non puoi inserire più di 5 entità figlie",
                "icon": "error"
            })
        }
    };

    document.getElementById("confirmISABtn").onclick = () => {
        const childNames = Array.from(inputs.children)
            .map((input) => input.value.trim())
            .filter(Boolean);

        if (childNames.length < 2) {
            Swal.fire({
                "title": "Errore",
                "text": "Inserisci almeno due figlio!",
                "icon": "error"
            })
            return;
        }

        const constraints = {
            total: document.getElementById("totalPartial").value,
            exclusivity: document.getElementById("exclusiveOverlap").value,
        };

        createISAHierarchy(childNames, constraints, parent);
        modal.classList.remove("active");
        parent.rect.stroke("#333");
        layer.batchDraw();
    };
}


function createISAHierarchy(childNames, constraints, parent) {
    const children = [];
    const parentCenter = {
        x: parent.rect.x() + parent.rect.width() / 2,
        y: parent.rect.y() + parent.rect.height() / 2,
    };

    // Crea entità figlie
    childNames.forEach((name, i) => {
        let entityTMP = createEntity(
            parentCenter.x - 60 + i * 150,
            parentCenter.y + 100
        );
        entityTMP.text.text(name);
        entityTMP.isChildren = true;
        children.push(entityTMP)
    });

    // Crea elementi della gerarchia
    const isaGroup = {
        id: Date.now(), // Identificatore univoco
        parent: parent,
        children: children,
        lines: [],
        connector: null,
        labels: null,
        update: function () {
            // Funzioni helper per calcolare coseno e seno dell'angolo della freccia
            function calcolaCosenoFreccia(arrowPoints) {
                const dx = arrowPoints[2] - arrowPoints[0];
                const dy = arrowPoints[3] - arrowPoints[1];
                const lunghezza = Math.sqrt(dx * dx + dy * dy);
                return lunghezza === 0 ? 0 : dx / lunghezza;
            }
            function calcolaSenoFreccia(arrowPoints) {
                const dx = arrowPoints[2] - arrowPoints[0];
                const dy = arrowPoints[3] - arrowPoints[1];
                const lunghezza = Math.sqrt(dx * dx + dy * dy);
                return lunghezza === 0 ? 0 : dy / lunghezza;
            }

            // Calcola i punti di connessione per i figli (centro orizzontale del rettangolo)
            const childPoints = children.map(child => ({
                x: child.rect.x() + child.rect.width() / 2,
                y: child.rect.y()
            }));


            // Determina il range orizzontale dei figli e la posizione della linea orizzontale
            const minX = Math.min(...childPoints.map(p => p.x));
            const maxX = Math.max(...childPoints.map(p => p.x));

            const minY = Math.min(...childPoints.map(p => p.y));
            const maxY = Math.max(...childPoints.map(p => p.y));

            let connectorY = childPoints[0].y - 40;

            const arrowCenter = {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
            };


            // Imposta la linea orizzontale (connettore)
            this.connector.points([minX, connectorY, maxX, connectorY]);

            // Imposta inizialmente la freccia con punti base
            this.arrow.points([
                arrowCenter.x,
                arrowCenter.y,
                parent.rect.x() + parent.rect.width() / 2,
                parent.rect.y() + parent.rect.height()
            ]);

            // Calcola coseno e seno della freccia
            const cosenoAngolo = calcolaCosenoFreccia(this.arrow.points());
            const senoAngolo = calcolaSenoFreccia(this.arrow.points());

            // Ricrea le linee per ogni figlio (assicurandosi di partire da una lista vuota)
            // this.lines = [];
            this.lines.forEach(element => {
                element.destroy()
            });
            this.lines = []

            children.forEach(() => {
                let lineTMP = new Konva.Line({
                    stroke: "#333",
                    strokeWidth: 2,
                    lineCap: "round"
                })
                this.lines.push(lineTMP);
                layer.add(lineTMP)
            });

            // Posiziona l'etichetta vicino al connettore
            let labelX = minX + 20;
            let labelY = connectorY - 25;

            // Se l'orientamento è prevalentemente verticale (|coseno| < 0.7)
            // Se la freccia è più verticale (coseno vicino a 0)
            if (Math.abs(cosenoAngolo) < 0.8) {
                let offset = 0
                if (senoAngolo < 0) {
                    // Se il seno è negativo, la freccia punta verso il basso
                    this.arrow.points([
                        arrowCenter.x,
                        connectorY,
                        parent.rect.x() + parent.rect.width() / 2,
                        parent.rect.y() + parent.rect.height()
                    ]);
                } else {
                    offset = 60
                    connectorY = childPoints[0].y + 100;
                    this.connector.points([minX, connectorY, maxX, connectorY]);
                    labelY = connectorY + 10
                    // Se il seno è positivo, la freccia punta verso l'alto
                    this.arrow.points([
                        arrowCenter.x,
                        connectorY,
                        parent.rect.x() + parent.rect.width() / 2,
                        parent.rect.y()
                    ]);
                }
                // Se la freccia è verticale, crea le linee verticali per collegare i figli
                this.lines.forEach((line, i) => {
                    line.points([
                        childPoints[i].x,
                        childPoints[i].y + offset,
                        childPoints[i].x,
                        connectorY
                    ]);
                });

            } else {

                let offset = 0
                let connectorX = 0;

                // Se la freccia è più orizzontale (coseno vicino a ±1)
                if (cosenoAngolo > 0) {

                    //DESTRO

                    // Se il seno è negativo, la freccia punta verso sinistra
                    connectorX = childPoints[0].x + 100;
                    this.arrow.points([
                        childPoints[0].x + 100,
                        arrowCenter.y,
                        parent.rect.x(),
                        parent.rect.y() + parent.rect.height() / 2
                    ]);

                    offset = 62

                    this.connector.points([connectorX, minY + 30, connectorX, maxY + 30]);

                    labelX = connectorX - 15
                } else {

                    //SINISTRA

                    // Se il seno è positivo, la freccia punta verso destra
                    connectorX = childPoints[0].x - 100;
                    this.arrow.points([
                        connectorX,
                        arrowCenter.y,
                        parent.rect.x() + parent.rect.width(),
                        parent.rect.y() + parent.rect.height() / 2
                    ]);
                    offset = -62
                    this.connector.points([connectorX, minY + 30, connectorX, maxY + 30]);

                    labelX = connectorX
                }
                this.lines.forEach((line, i) => {
                    line.points([
                        childPoints[i].x + offset,
                        childPoints[i].y + 30,
                        this.connector.points()[2],
                        childPoints[i].y + 30,
                    ]);
                });
                labelY = minY
            }

            this.label.position({ x: labelX, y: labelY });

            // Imposta il flag del padre
            parent.isParent = true;

        }

    };

    isaGroup.connector = new Konva.Line({
        stroke: "#333",
        strokeWidth: 2,
    });

    isaGroup.arrow = new Konva.Arrow({
        pointerLength: 10,
        pointerWidth: 10,
        stroke: "#333",
        fill: "#fff",
    });

    isaGroup.label = new Konva.Text({
        text: `(${constraints.total}, ${constraints.exclusivity})`.toUpperCase(),
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#333",
    });

    // Aggiungi al layer
    isaGroup.lines.forEach((line) => layer.add(line));
    layer.add(isaGroup.connector);
    layer.add(isaGroup.arrow);
    layer.add(isaGroup.label);

    // Funzione di aggiornamento
    const updateHandler = () => {
        isaGroup.update();
        layer.batchDraw();
    };

    // Aggiungi listener per il trascinamento
    children.forEach((child) => {
        child.rect.on("dragmove", updateHandler);
    });
    parent.rect.on("dragmove", updateHandler);
    isaRelations.push(isaGroup);
    updateHandler();
}
