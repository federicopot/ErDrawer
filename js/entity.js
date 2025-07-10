/*
███████╗███╗   ██╗████████╗██╗████████╗██╗   ██╗
██╔════╝████╗  ██║╚══██╔══╝██║╚══██╔══╝╚██╗ ██╔╝
█████╗  ██╔██╗ ██║   ██║   ██║   ██║    ╚████╔╝
██╔══╝  ██║╚██╗██║   ██║   ██║   ██║     ╚██╔╝  
███████╗██║ ╚████║   ██║   ██║   ██║      ██║  
╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝   ╚═╝      ╚═╝                                         
*/

import { layer, entities, relationships } from './app.js' // importo per la app principale
import { showModalName, ModelTypes, getEdgePoint } from './utility.js' // importo per le utility comuni

export function createEntity(x, y) {
    const entity = {
        rect: new Konva.Rect({
            x,
            y,
            width: 120,
            height: 60,
            fill: "#fff",
            stroke: "#333",
            strokeWidth: 2,
            draggable: true,
        }),
        text: new Konva.Text({
            text: "Entità",
            fontSize: 16,
            fontFamily: "Arial",
            fill: "#333",
            width: 120,
            align: "center",
            wrap: "word",
            padding: 10,
            listening: false,
        }),
        resize: new Konva.Line({
            points: [x, y, x + 15, y, x, y + 15],
            fill: "#fff0",
            stroke: "#4CAF50",
            strokeWidth: 3,
            closed: true,
        }),
        attributes: [],
        composedKey: false,
        composedKeyRel: false,
        Composed: {
            line: null,
            circle: null,
            rel: null
        },
        isParent: false,
        isChildren: false
    };

    // Centra il testo all'interno del rettangolo
    entity.text.position({
        x: entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
        y: entity.rect.y() + (entity.rect.height() - entity.text.height()) / 2,
    });

    entity.rect.on("dragmove", () => {
        entity.text.position({
            x: entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
            y: entity.rect.y() + (entity.rect.height() - entity.text.height()) / 2,
        });

        entity.resize.points([
            entity.rect.x(),
            entity.rect.y(),
            entity.rect.x() + 15,
            entity.rect.y(),
            entity.rect.x(),
            entity.rect.y() + 15,
        ]);
        updateAllConnections();
    });

    // do something else on right click
    entity.resize.on("click", (e) => {
        if (e.evt.button === 2) {
            let transform;
            if (transform == null) {
                transform = new Konva.Transformer({
                    nodes: [entity.rect],
                    enabledAnchors: [
                        "top-left",
                        "top-right",
                        "top-center",
                        "bottom-left",
                        "middle-right",
                        "middle-left",
                        "bottom-right",
                    ],
                });
                transform.on("click", (ev) => {
                    if (ev.evt.button === 2) {
                        // entity.rect.width(transform.width()-2)

                        transform.destroy();
                    }
                });
                transform.on("transformend", (ev) => {
                    entity.rect.width(transform.width() - 2);
                    entity.rect.height(transform.height() - 2);
                    entity.rect.scaleX(1);
                    entity.rect.scaleY(1);
                });

                transform.on("transform", (ev) => {
                    entity.text.position({
                        x:
                            entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
                        y:
                            entity.rect.y() +
                            (entity.rect.height() - entity.text.height()) / 2,
                    });
                    entity.resize.points([
                        entity.rect.x(),
                        entity.rect.y(),
                        entity.rect.x() + 15,
                        entity.rect.y(),
                        entity.rect.x(),
                        entity.rect.y() + 15,
                    ]);
                    updateAllConnections();
                });

                transform.rotateEnabled(false);
                layer.add(transform);
            }
        }
    });

    entity.rect.on("dblclick", () => showModalName(entity.text, ModelTypes.ENTITY));
    
    entity.rect.on("dragmove", () => {

        entity.attributes.forEach(element => {
            function clamp(value, min, max) {
                return Math.max(min, Math.min(max, value));
            }

            let X = clamp(element.circle.x(), entity.rect.x(), entity.rect.x() + entity.rect.width());

            let Y = clamp(element.circle.y(), entity.rect.y(), entity.rect.y() + entity.rect.height());
            element.line.points([
                X,
                Y,
                element.circle.x(),
                element.circle.y(),
            ]);


            element.text.x(element.circle.x() - element.circle.radius());
            element.text.y(element.circle.y() - 25);
        });

        layer.batchDraw();
    });
    layer.add(entity.rect);
    layer.add(entity.text);
    layer.add(entity.resize);
    entities.push(entity);
    layer.batchDraw();
    return entity;
}


export function updateAllConnections() {
    relationships.forEach(rel => {
        const rhombusPos = rel.rhombus.position();

        // Aggiorna le cardinalità (labels) posizionandole a metà tra il bordo dell'entità e il rombo
        rel.entities.forEach((entity, i) => {
            const edgePoint = getEdgePoint(entity, rhombusPos);
            rel.cards[i].position({
                x: (edgePoint.x + rhombusPos.x) / 2 - 10,
                y: (edgePoint.y + rhombusPos.y) / 2 - 15
            });
        });

        // Centra il testo della relazione sul rombo
        rel.text.position({
            x: rhombusPos.x - rel.text.width() / 2,
            y: rhombusPos.y - rel.text.height() / 2
        });
        let zonesUsed = {
            sopra: false,
            sotto: false,
            sinistra: false,
            destra: false
        };

        // Se ci sono entità nella relazione, calcola i "corner" (top, bottom, left, right)
        if (rel.entities.length > 0) {
            // Inizializzazione con la prima entità
            let topEntity = rel.entities[0],
                bottomEntity = rel.entities[0],
                leftEntity = rel.entities[0],
                rightEntity = rel.entities[0];

            let firstEntityCenterX =
                rel.entities[0].rect.x() + rel.entities[0].rect.width() / 2;
            let firstEntityCenterY =
                rel.entities[0].rect.y() + rel.entities[0].rect.height() / 2;
            let topY = firstEntityCenterY;
            let bottomY = firstEntityCenterY;
            let leftX = firstEntityCenterX;
            let rightX = firstEntityCenterX;

            // Funzione per determinare la zona in cui cade un punto rispetto al rombo
            function getZone(px, py, rhombus) {
                const cx = rhombus.x(); // Centro X del rombo
                const cy = rhombus.y(); // Centro Y del rombo

                const dx = px - cx;
                const dy = py - cy;

                // Se il punto è molto vicino al centro, lo consideriamo "centro"
                if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                    return "centro";
                }

                // Calcola l'angolo in gradi
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                if (angle < 0) angle += 360;


                // Zone principali (cardinali)
                if (angle >= 45 && angle < 135) return "sopra";
                if (angle >= 135 && angle < 225) return "sinistra";
                if (angle >= 225 && angle < 315) return "sotto";
                if (angle >= 315 || angle < 45) return "destra";


                // Zone intermedie (diagonali)
                if (angle >= 22.5 && angle < 67.5) return "basso-destra";
                if (angle >= 112.5 && angle < 157.5) return "basso-sinistra";
                if (angle >= 202.5 && angle < 247.5) return "alto-sinistra";
                if (angle >= 292.5 && angle < 337.5) return "alto-destra";

                return "fuori"; // Caso particolare (non dovrebbe accadere)
            }

            // Calcola i corner basandosi sul centro di ciascuna entità
            rel.entities.forEach((entity, i) => {
                const centerX = entity.rect.x() + entity.rect.width() / 2;
                const centerY = entity.rect.y() + entity.rect.height() / 2;

                // Valuta la zona rispetto al rombo usando il centro dell'entità
                const zone = getZone(centerX, centerY, rel.rhombus);
                let entityPos = {
                    x: 0,
                    y: 0
                }
                let rhombusPosTrue = {
                    x: 0,
                    y: 0
                }
                switch (zone) {
                    case "sotto":
                        entityPos.x = (entity.rect.width() / 2) + entity.rect.x()
                        entityPos.y = entity.rect.height() + entity.rect.y()
                        rhombusPosTrue.x = rel.rhombus.x()
                        rhombusPosTrue.y = rel.rhombus.y() - (rel.rhombus.radius() * 0.7)
                        topEntity = entity;
                        break;
                    case "sopra":
                        entityPos.x = (entity.rect.width() / 2) + entity.rect.x()
                        entityPos.y = entity.rect.y()
                        rhombusPosTrue.x = rel.rhombus.x()
                        rhombusPosTrue.y = rel.rhombus.y() + (rel.rhombus.radius() * 0.7)
                        bottomEntity = entity;
                        break;
                    case "destra":
                        entityPos.x = entity.rect.x()
                        entityPos.y = (entity.rect.height() / 2) + entity.rect.y()
                        rhombusPosTrue.x = rel.rhombus.x() + rel.rhombus.radius()
                        rhombusPosTrue.y = rel.rhombus.y()
                        rightEntity = entity;
                        break;
                    case "sinistra":
                        entityPos.x = entity.rect.x() + entity.rect.width()
                        entityPos.y = (entity.rect.height() / 2) + entity.rect.y()
                        rhombusPosTrue.x = rel.rhombus.x() - rel.rhombus.radius()
                        rhombusPosTrue.y = rel.rhombus.y()
                        leftEntity = entity;
                        break;
                    // Le diagonali possono essere gestite se necessario
                    default:
                        break;
                }

                rel.lines[i].points([
                    entityPos.x,
                    entityPos.y,
                    rhombusPosTrue.x,
                    rhombusPosTrue.y
                ]);

            });

            // Assegna le entità calcolate come corner della relazione
            rel.cornersEntity = {
                top: topEntity,
                bottom: bottomEntity,
                left: leftEntity,
                right: rightEntity
            };
        }
    });
    layer.batchDraw();
}