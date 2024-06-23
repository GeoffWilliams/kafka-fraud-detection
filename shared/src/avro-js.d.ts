// quick and dirty minimal typescript support for avro-js
// includes only what I am using :)
// declare const AvroTypescriptBufferConverter = {
//     toBuffer: (object: any) => any,
//     fromBuffer: (buff: Buffer) => any,
// }
declare module 'avro-js' {
    interface AvroTypescriptBufferConverter {
        toBuffer: (object: any) => any,
        fromBuffer: (buff: Buffer) => any,
    }

    // export declare const parse = (schema: any) => AvroTypescriptBufferConverter;
    export const parse = (schema: any) => AvroTypescriptBufferConverter;
}