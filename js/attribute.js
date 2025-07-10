/*
 █████╗ ████████╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗
██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
███████║   ██║      ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗  
██╔══██║   ██║      ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝  
██║  ██║   ██║      ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗
╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
*/

import { layer, entities, relationships, stage } from './app.js' // importo per la app principale
import { showModalName, ModelTypes, getConnectionPoint, clamp } from './utility.js' // importo per le utility comuni

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
            targetEntity.attributes
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

        }

        const updatePosition = () => {
            if (attr.attached) {
                const attachedAttrs = targetEntity.attributes.filter((a) => a.attached);
                const idx = attachedAttrs.indexOf(attr);
                const effectiveIndex = idx === -1 ? targetEntity.attributes.length : idx;
                //const totalAttached = attachedAttrs.length ? attachedAttrs.length : 1;

                const newConnPoint = getConnectionPoint(
                    targetEntity,
                    effectiveIndex,
                    // totalAttached + 1
                    2
                );

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
            let clampedX = clamp(currentX, targetEntity.rect.x(), targetEntity.rect.x() + targetEntity.rect.width());
            let clampedY = clamp(currentY, targetEntity.rect.y(), targetEntity.rect.y() + targetEntity.rect.height());

            attr.line.points([clampedX, clampedY, currentX, currentY]);
            // createLineConnectionPrimary(targetEntity);
            attr.text.x(currentX - attr.circle.radius());
            attr.text.y(currentY - 25);
            layer.batchDraw();
        });
        attr.text.on("dblclick", (function(e){
            showModalName()
        }))

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

