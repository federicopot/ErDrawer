import { entities, relationMode, setRelationMode, stage, relationshipID, setRelationshipID, layer, relationships } from "./app.js";
import { updateAllConnections } from "./entity.js";
import { checkCardinals, ModelTypes, showModalName } from "./utility.js";

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
                showModalName(null, ModelTypes.RELATIONSHIP, ...selectedEntities);
                cleanupSelection();
            }
        }
    };
    // Gestore per il tasto Escape: conferma la selezione se sono state selezionate almeno minEntities
    const keydownHandler = async (event) => {
        if (event.key === "Escape") {
            if (selectedEntities.length >= minEntities) {
                // showRelationModal(...selectedEntities);
                let data = await showModalName(null, ModelTypes.RELATIONSHIP, selectedEntities)
                createConnection(selectedEntities, data[0], data[1]);
                cleanupSelection();

            } else {
                cleanupSelection();
                Swal.fire({
                    icon: "warning",
                    title: "Selezione incompleta",
                    text: `Devi selezionare almeno ${minEntities} entità.`,
                    confirmButtonText: "Ok"
                });
            }
        }
    };
    // Rimuove i listener quando la selezione è terminata
    const cleanupSelection = () => {
        setRelationMode(false)
        console.log(relationMode)
        stage.off("click tap", clickHandler);
        window.removeEventListener("keydown", keydownHandler);
        selectedEntities.forEach(element => {
            element.rect.stroke('#333')
        });
    };
    stage.on("click tap", clickHandler);
    window.addEventListener("keydown", keydownHandler);
}
/**
 * Verifica che il formato della cardinalità sia corretto.
 * Il formato atteso è "min, max" (ad esempio "1, N" oppure "0, 1").
 */

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
        attributes: [],
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