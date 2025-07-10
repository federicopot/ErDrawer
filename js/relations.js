import { entities, relationMode, setRelationMode, stage, relationshipID, setRelationshipID, layer, relationships } from "./app.js";
import { updateAllConnections } from "./entity.js";

export function createRelationship() {
    // Verifica che ci siano almeno 2 entità sul canvas
    if (entities.length < 2) {
        Swal.fire({
            icon: "warning",
            title: "Entità insufficienti!",
            text: "Devi avere almeno 2 entità per creare una relazione.",
            confirmButtonText: "Ok"
        });
        return;
    }
    setRelationMode(true)
    let selectedEntities = [];
    const minEntities = 2;
    const maxEntities = 4;
    Swal.fire({
        icon: "info",
        title: "Seleziona entità",
        text: `Clicca su almeno ${minEntities} e fino a ${maxEntities} entità. Premi Escape per confermare la selezione.`,
        confirmButtonText: "Ok"
    });
    // Gestore per il click/tap sulle entità
    const clickHandler = (e) => {
        // Trova l'entità corrispondente all'elemento cliccato
        const targetEntity = entities.find(entity => entity.rect === e.target);
        if (targetEntity && !selectedEntities.includes(targetEntity)) {
            selectedEntities.push(targetEntity);
            // Evidenzia l'entità selezionata
            targetEntity.rect.stroke("#4CAF50");
            // Se si raggiunge il numero massimo, conferma automaticamente la selezione
            if (selectedEntities.length === maxEntities) {
                showRelationModal(...selectedEntities);
                cleanupSelection();
            }
        }
    };
    // Rimuove i listener quando la selezione è terminata
    const cleanupSelection = () => {
        setRelationMode(false)
        stage.off("click tap", clickHandler);
        window.removeEventListener("keydown", keydownHandler);
        selectedEntities.forEach(element => {
            element.rect.stroke('#333')
        });
    };
    // Gestore per il tasto Escape: conferma la selezione se sono state selezionate almeno minEntities
    const keydownHandler = (event) => {
        if (event.key === "Escape") {
            if (selectedEntities.length >= minEntities) {
                showRelationModal(...selectedEntities);
                cleanupSelection();
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Selezione incompleta",
                    text: `Devi selezionare almeno ${minEntities} entità.`,
                    confirmButtonText: "Ok"
                });
            }
        }
    };
    stage.on("click tap", clickHandler);
    window.addEventListener("keydown", keydownHandler);
}
/**
 * Mostra il modale per inserire il nome della relazione e le cardinalità.
 * Vengono mostrate (e ripulite) tante "card" quanti sono gli oggetti entità passati.
 */
function showRelationModal(...entities) {
    const relationModal = document.getElementById("relationModal");
    relationModal.classList.add("active");
    // Mostra solo le card corrispondenti alle entità selezionate
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        if (index < entities.length) {
            card.style.display = "block";
            card.innerText = entities[index].name || `Entità ${index + 1}`;
        } else {
            card.style.display = "none";
        }
    });
    // Ripristina i campi del modale
    document.getElementById("relNameInput").value = "";
    // Supporto fino a 4 entità: resetta tutti i campi di cardinalità
    const cardinalFields = ["card1Input", "card2Input", "card3Input", "card4Input"];
    cardinalFields.forEach(field => {
        document.getElementById(field).value = "";
    });
    // Rimuove eventuali listener precedenti sul pulsante di conferma
    const confirmBtn = document.getElementById("confirmRelationBtn");
    confirmBtn.onclick = () => {
        const relName = document.getElementById("relNameInput").value.trim();
        if (!relName) {
            Swal.fire({
                icon: "warning",
                title: "Campo relazione mancante!",
                text: "Compila il nome della relazione.",
                confirmButtonText: "Ok"
            });
            return;
        }
        let cardValues = [];
        // Per ciascuna entità selezionata, verifica il campo di cardinalità corrispondente
        for (let i = 0; i < entities.length; i++) {
            const cardInput = document.getElementById(`card${i + 1}Input`);
            const cardValue = cardInput.value.trim();
            if (!cardValue) {
                Swal.fire({
                    icon: "warning",
                    title: "Campo mancante!",
                    text: `Compila il campo per la cardinalità dell'entità ${i + 1}.`,
                    confirmButtonText: "Ok"
                });
                return;
            }
            if (!checkCardinals(cardValue)) {
                Swal.fire({
                    icon: "error",
                    title: "Formato non valido!",
                    text: `La cardinalità per l'entità ${i + 1} non è nel formato corretto.`,
                    confirmButtonText: "Riprova"
                });
                return;
            }
            cardValues.push(cardValue);
        }
        // Crea la connessione passandogli le entità selezionate, il nome della relazione e le cardinalità
        createConnection(entities, relName, cardValues);
        Swal.fire({
            icon: "success",
            title: "Relazione creata!",
            text: `La relazione "${relName}" è stata aggiunta con successo.`,
            confirmButtonText: "Fantastico!"
        });
        // Chiude il modale
        relationModal.classList.remove("active");
    };
}
/**
 * Verifica che il formato della cardinalità sia corretto.
 * Il formato atteso è "min, max" (ad esempio "1, N" oppure "0, 1").
 */
function checkCardinals(card) {
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
/*
 ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║
██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                                                                
*/
function createConnection(entities, relName, cardValues) {
    const rhombusWidth = 100;
    setRelationshipID(relationshipID+1)
    const relationship = {
        lines: entities.map(() => new Konva.Line({
            stroke: "#333",
            strokeWidth: 2,
            lineCap: "round"
        })),
        rhombus: new Konva.RegularPolygon({
            sides: 4,
            radius: rhombusWidth / 2,
            fill: "#fff",
            stroke: "#333",
            strokeWidth: 2,
            draggable: true,
            scaleY: 0.7
        }),
        text: new Konva.Text({
            text: `${relName}`,
            fontSize: 12,
            fill: "#333",
            listening: false
        }),
        entities: entities,
        cards: cardValues.map((card, i) => new Konva.Text({
            text: `(${card})`,
            fontSize: 12,
            fill: "#333",
            // La posizione verrà aggiornata successivamente
        })),
        attributies: [],
        ID: relationshipID+1, // si assume che relationshipID sia definito globalmente
        cornersEntity: {
            top: null,
            bottom: null,
            left: null,
            right: null
        }
    };
    let AvgX = 0
    let AvgY = 0
    relationship.entities.forEach(el => {
        AvgX += el.rect.x()
        AvgY += el.rect.y()
    })
    AvgX = AvgX / relationship.entities.length
    AvgY = AvgY / relationship.entities.length
    relationship.rhombus.x(AvgX)
    relationship.rhombus.y(AvgY)
    // Aggiunge tutti gli elementi al layer
    relationship.lines.forEach(line => layer.add(line));
    layer.add(relationship.rhombus);
    relationship.cards.forEach(card => layer.add(card));
    layer.add(relationship.text);
    relationships.push(relationship);
    updateAllConnections();
    relationship.rhombus.on("dblclick", () => showNameModal(relationship.text));
    relationship.rhombus.on("dragmove", updateAllConnections)
}
/**
 * Calcola il centro (centroide) fra le entità per posizionare il rombo.
 */
function calculateCentroid(entities) {
    const sum = entities.reduce((acc, e) => ({
        x: acc.x + e.rect.x() + e.rect.width() / 2,
        y: acc.y + e.rect.y() + e.rect.height() / 2
    }), { x: 0, y: 0 });
    return {
        x: sum.x / entities.length,
        y: sum.y / entities.length
    };
}