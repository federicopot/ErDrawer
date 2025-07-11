/*
 █████╗ ████████╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗
██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
███████║   ██║      ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗  
██╔══██║   ██║      ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝  
██║  ██║   ██║      ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗
╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
*/

import { layer, entities, relationships, stage } from './app.js' // importo per la app principale
import { showModalName, ModelTypes, getConnectionPoint, clamp, getConnectionPointRel, getRhombusIntersection } from './utility.js' // importo per le utility comuni

export function addAttribute() {

    Swal.fire({
        "title": "Aggiungere un attributo",
        "text": "Seleziona prima un entità oppure una associazione",
        "icon": "info"
    })

    const handler = async (e) => {
        let targetEntity = entities.find((entity) => entity.rect === e.target);
        let targetRel = relationships.find((rel) => rel.rhombus === e.target);
        // console.log(targetEntity)
        if (!targetEntity && !targetRel) {
            Swal.fire({
                "title": "Errore",
                "text": "Nessun elemento selezionato!",
                "icon": "warning"
            })
            stage.off("click tap", handler);
            return;
        }

        let tmpText = new Konva.Text({
            text: "",
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#333",
            padding: 5,
            listening: false,
        })
        let isPrimaryKey = false
        let data = await showModalName(tmpText, ModelTypes.ATTRIBUTE)
        isPrimaryKey = data[1]
        tmpText.fontStyle(isPrimaryKey ? "bold" : "normal")
        tmpText.text(data[0])

        const attr = {
            circle: new Konva.Circle({
                radius: 5,
                fill: isPrimaryKey ? "#333" : "#fff",
                stroke: "#333",
                strokeWidth: isPrimaryKey ? 5 : 5,
                draggable: true,
            }),
            text: tmpText,
            line: new Konva.Line({
                stroke: "#333",
                strokeWidth: 2,
                draggable: false,
            }),
            attached: true,
            isPrimaryKey: isPrimaryKey,
        };

        if (targetEntity) {
            const total = targetEntity.attributes.length + 1;
            const index = targetEntity.attributes.length;
            const connectionPoint = getConnectionPoint(targetEntity, index, total);
            // Posizione iniziale
            const startPos = {
                x: connectionPoint.x + 20,
                y: connectionPoint.y,
            };
            attr.circle.position(startPos);
            attr.text.position({
                x: startPos.x + 15,
                y: startPos.y - 7,
            });
            attr.line.points([
                connectionPoint.x,
                connectionPoint.y,
                startPos.x,
                startPos.y,
            ]);

            targetEntity.attributes.push(attr)

        } else {

            const total = targetRel.attributes.length + 1;
            const index = targetRel.attributes.length;

            const connectionPoint = getConnectionPointRel(targetRel, index, total);
            // Posizione iniziale
            const startPos = {
                x: connectionPoint.x + 20,
                y: connectionPoint.y,
            };
            attr.circle.position(startPos);
            attr.text.position({
                x: startPos.x + 15,
                y: startPos.y - 7,
            });
            attr.line.points([
                connectionPoint.x,
                connectionPoint.y,
                startPos.x,
                startPos.y,
            ]);

            //sezione per attaccare l'attributo al rombo
            let currentX = attr.circle.x();
            let currentY = attr.circle.y();

            const rhombus = targetRel.rhombus;
            const cx = rhombus.x();
            const cy = rhombus.y();
            const r = rhombus.radius();
            const scaleY = rhombus.scaleY ? rhombus.scaleY() : 1;

            const w = r * 2;
            const h = r * 2 * scaleY;

            const halfW = w / 2;
            const halfH = h / 2;

            const points = [
                { x: cx, y: cy - halfH }, // top
                { x: cx + halfW, y: cy }, // right
                { x: cx, y: cy + halfH }, // bottom
                { x: cx - halfW, y: cy }, // left
            ];

            const intersection = getRhombusIntersection(
                cx,
                cy,
                points,
                currentX,
                currentY
            );

            attr.line.points([intersection.x, intersection.y, currentX, currentY]);
            attr.text.x(currentX - attr.circle.radius());
            attr.text.y(currentY - 25);
            targetRel.attributes.push(attr)
        }

        const updatePosition = () => {
            if (attr.attached) {
                const isEntity = !!targetEntity;
                const target = isEntity ? targetEntity : targetRelation;

                const attachedAttrs = target.attributes.filter((a) => a.attached);
                const idx = attachedAttrs.indexOf(attr);
                const effectiveIndex = idx === -1 ? target.attributes.length : idx;

                const newConnPoint = isEntity
                    ? getConnectionPoint(targetEntity, effectiveIndex, 2)
                    : getConnectionPointRel(targetRelation, effectiveIndex, 2);

                attr.line.points([
                    newConnPoint.x,
                    newConnPoint.y,
                    attr.circle.x(),
                    attr.circle.y(),
                ]);
            } else {
                attr.line.points([
                    connectionPoint.x,
                    connectionPoint.y,
                    attr.circle.x(),
                    attr.circle.y(),
                ]);
            }
            attr.text.position({
                x: attr.circle.x() + 15,
                y: attr.circle.y() - 7,
            });
        };

        attr.circle.on("dragmove", function (e) {
            let currentX = attr.circle.x();
            let currentY = attr.circle.y();

            if (targetEntity) {
                let clampedX = clamp(
                    currentX,
                    targetEntity.rect.x(),
                    targetEntity.rect.x() + targetEntity.rect.width()
                );
                let clampedY = clamp(
                    currentY,
                    targetEntity.rect.y(),
                    targetEntity.rect.y() + targetEntity.rect.height()
                );

                attr.line.points([clampedX, clampedY, currentX, currentY]);
                attr.text.x(currentX - attr.circle.radius());
                attr.text.y(currentY - 25);
                createComposePrimaryKey(targetEntity)
            } else if (targetRel) {
                const rhombus = targetRel.rhombus;
                const cx = rhombus.x();
                const cy = rhombus.y();
                const r = rhombus.radius();
                const scaleY = rhombus.scaleY ? rhombus.scaleY() : 1;

                const w = r * 2;
                const h = r * 2 * scaleY;

                const halfW = w / 2;
                const halfH = h / 2;

                const points = [
                    { x: cx, y: cy - halfH }, // top
                    { x: cx + halfW, y: cy }, // right
                    { x: cx, y: cy + halfH }, // bottom
                    { x: cx - halfW, y: cy }, // left
                ];

                const intersection = getRhombusIntersection(
                    cx,
                    cy,
                    points,
                    currentX,
                    currentY
                );

                attr.line.points([intersection.x, intersection.y, currentX, currentY]);
                attr.text.x(currentX - attr.circle.radius());
                attr.text.y(currentY - 25);
                createComposePrimaryKey(targetRel)
            }

            layer.batchDraw();
        });
        attr.circle.on("dblclick", async () => {
            let data = await showModalName(tmpText, ModelTypes.ATTRIBUTE)
            if (data != undefined) {
                isPrimaryKey = data[1]
                attr.text.fontStyle(isPrimaryKey ? "bold" : "normal")
                attr.text.text(data[0])
                attr.circle.fill(isPrimaryKey ? "#333" : "#fff")
                attr.isPrimaryKey = isPrimaryKey
            }
            console.trace(attr)
        })

        layer.add(attr.line);
        layer.add(attr.circle);
        layer.add(attr.text);



        layer.batchDraw();
        stage.off("click tap", handler);
    };
    stage.on("click tap", handler);
}

export async function addAttributeStatic(entityRelation, attribute_name, primary) {

    let tmpText =
        isPrimaryKey = data[1]
    tmpText.text(data[0])

    const attr = {
        circle: new Konva.Circle({
            radius: 5,
            fill: isPrimaryKey ? "#333" : "#fff",
            stroke: "#333",
            strokeWidth: isPrimaryKey ? 5 : 5,
            draggable: true,
        }),
        text: new Konva.Text({
            text: attribute_name,
            fontSize: 14,
            fontFamily: "Arial",
            fill: "#333",
            fontStyle: isPrimaryKey ? "bold" : "normal",
            padding: 5,
            listening: false,
        }),
        line: new Konva.Line({
            stroke: "#333",
            strokeWidth: 2,
            draggable: false,
        }),
        attached: true,
        isPrimaryKey: isPrimaryKey,
    };


    layer.add(attr.line);
    layer.add(attr.circle);
    layer.add(attr.text);


    layer.batchDraw();
}

function createComposePrimaryKey(obj) {
    const OFFSET = 15;
    const LINE_STYLE = {
        stroke: "#4CAF50",
        strokeWidth: 3,
        lineJoin: 'round'
    };

    // 1. Prendi gli attributi primari
    let primaryAttributes = obj.attributes?.filter(attr => attr.isPrimaryKey);
    if (!primaryAttributes || primaryAttributes.length < 2) return;

    // 2. Elimina la linea precedente se esiste
    if (obj.Composed?.line) obj.Composed.line.destroy();
    if (obj.Composed?.circle) obj.Composed.circle.destroy();

    const coords = [];

    // 3. Ordina gli attributi per posizione X/Y
    primaryAttributes.sort((a, b) => {
        const ax = a.circle ? a.circle.x() : a.x;
        const ay = a.circle ? a.circle.y() : a.y;
        const bx = b.circle ? b.circle.x() : b.x;
        const by = b.circle ? b.circle.y() : b.y;
        return ax === bx ? ay - by : ax - bx;
    });

    // 4. Calcola i punti da connettere
    let previous = null;

    primaryAttributes.forEach((attr, index) => {
        const rect = obj.rect;
        const pos = getAttributePosition(attr, obj);
        const point = getOffsetPoint(attr, obj.rect, OFFSET);

        

        if (index > 0 && previous) {
            const transition = calculateTransitionPoints(
                previous.pos,
                pos,
                obj.rect
            );

            transition.forEach(([tx, ty]) => coords.push(tx, ty));
        }

        coords.push(point.x, point.y);
        previous = { x: point.x, y: point.y, pos };
    });


    // 5. Regola inizio e fine con "freccetta visiva"
    const dx = coords[2] - coords[0];
    const dy = coords[3] - coords[1];
    const norm = Math.sqrt(dx * dx + dy * dy);

    if (norm > 0) {
        coords[0] += (dx / norm);
        coords[1] += (dy / norm);
    }

    const len = coords.length;
    const dxEnd = coords[len - 2] - coords[len - 4];
    const dyEnd = coords[len - 1] - coords[len - 3];
    const normEnd = Math.sqrt(dxEnd * dxEnd + dyEnd * dyEnd);

    if (normEnd > 0) {
        coords[len - 2] += (dxEnd / normEnd) * OFFSET;
        coords[len - 1] += (dyEnd / normEnd) * OFFSET;
    }
    if (coords.length >= 4) {
        const dx = coords[2] - coords[0];
        const dy = coords[3] - coords[1];
        const norm = Math.sqrt(dx * dx + dy * dy);

        if (norm > 0) {
            const startX = coords[0] - (dx / norm) * OFFSET;
            const startY = coords[1] - (dy / norm) * OFFSET;

            coords.unshift(startY); // inserisci Y prima
            coords.unshift(startX); // poi X (per mantenere ordine [x0,y0,x1,y1,...])
        }
    }

    // 6. Crea la linea
    const line = new Konva.Line({
        points: coords,
        ...LINE_STYLE,
    });

    // 7. Crea il cerchietto finale
    const circle = new Konva.Circle({
        x: coords[coords.length - 2],
        y: coords[coords.length - 1],
        radius: 7,
        fill: "#4CAF50",
        stroke: "#2E7D32",
        strokeWidth: 2,
    });

    // 8. Salva la connessione composta
    obj.Composed = {
        line,
        circle,
        rel: obj.Composed?.rel || null
    };

    layer.add(line);
    layer.add(circle);
    layer.batchDraw();
}

const getAttributePosition = (attr, entity) => {
    if(entity.rect == undefined) return

    const rect = entity.rect;
 
    let x = 0;
    let y = 0;
    if(attr.line!= null){
        x = attr.line.points()[0];
        y = attr.line.points()[1];
    }else{
        x = attr.x
        y = attr.y
    }
    if (Math.abs(x - rect.x()) < 5) return 'left';
    if (Math.abs(x - (rect.x() + rect.width())) < 5) return 'right';
    if (Math.abs(y - rect.y()) < 5) return 'top';
    if (Math.abs(y - (rect.y() + rect.height())) < 5) return 'bottom';
    return 'unknown';
};

function calculateTransitionPoints(prevPos, currPos, rect, OFFSET = 15) {
    if(rect == undefined) return

    const transitions = {
        'top-bottom': [
            [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET],    // Angolo sinistro superiore
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET] // Angolo sinistro inferiore
        ],
        'bottom-top': [
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET], // Angolo destro inferiore
            [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]  // Angolo destro superiore
        ],
        'top-right': [
            [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]
        ],
        'right-bottom': [
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'bottom-right': [
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'bottom-left': [
            [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'left-bottom': [
            [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'left-top': [
            [rect.x() - OFFSET, rect.y() - OFFSET]
        ],
        'right-left': [
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET],
            [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'left-right': [
            [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET],
            [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
        ],
        'top-left': [
            [rect.x() - OFFSET, rect.y() - OFFSET]
        ],
        'right-top': [
            [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]
        ]
    };

    const transitionKey = `${prevPos}-${currPos}`.toLowerCase();
    let points = transitions[transitionKey] ? [...transitions[transitionKey]] : [];
    return points;
}
function getOffsetPoint(attr, rect, OFFSET = 15) {
    const pos = getAttributePosition(attr, { rect });

    const x = attr.circle ? attr.circle.x() : attr.x;
    const y = attr.circle ? attr.circle.y() : attr.y;

    switch (pos) {
        case "left":
            return { x: rect.x() - OFFSET, y };
        case "right":
            return { x: rect.x() + rect.width() + OFFSET, y };
        case "top":
            return { x, y: rect.y() - OFFSET };
        case "bottom":
            return { x, y: rect.y() + rect.height() + OFFSET };
        default:
            return { x, y }; // fallback
    }
}
