import { Annotation, AnnotationPageNormalized, Canvas, CanvasNormalized, ExternalResourceTypes } from "@hyperion-framework/types";
export interface CanvasEntity {
    canvas: CanvasNormalized | undefined;
    annotationPage: AnnotationPageNormalized | undefined;
    annotations: Array<Annotation | undefined>;
}
export declare const getCanvasByCriteria: (vault: any, item: Canvas, motivation: string, paintingType: Array<ExternalResourceTypes>) => CanvasEntity;
