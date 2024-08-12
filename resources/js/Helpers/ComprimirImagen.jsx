import Compressor from "compressorjs";
export const ComprimirImagen = () => {
    const comprimir = (file) => {
        console.log((file.size/1024)/1024)
        if (!file) {
            return;
        }
    
        return new Promise((resolve, reject)=>{

            new Compressor(file, {
                quality: 0.1,
                success(result) {
                    console.log((result.size/1024)/1024)
                    console.log(result);
                    resolve(result);                    
                },
                error(err) {
                    console.log(err.message);
                    reject(err);
                },
            });
        })
        };

    return { comprimir };
};
