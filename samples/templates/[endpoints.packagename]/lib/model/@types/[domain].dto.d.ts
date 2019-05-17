export namespace DTO {
    export interface [Domain] {
        [$for members]
        [field]: [type];
        [^for members]
    }
}