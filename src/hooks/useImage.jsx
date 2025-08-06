import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';

const url = "https://nvugjssjjxtbbjnwimek.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dWdqc3Nqanh0YmJqbndpbWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzQwMzYsImV4cCI6MjA2ODkxMDAzNn0.YmxytSxfK2XHDmSMT2T9IsTU6O9i-Ekn86k2be9ePCk"
export const supabase = createClient(url, key, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
})

export const useImage = () => {
    const [imageList, setImageList] = useState([]);
    const setWebp = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        let newImagePaths = [];
        for (const file of files) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.');
                continue;
            }
            try {
                const today = new Date();
                const webp = await imageCompression(file, {
                    maxSizeMB: 1, // 최대 용량 (1MB 이하로 압축)
                    maxWidthOrHeight: 1480, // 최대 크기
                    useWebWorker: true, // ui가 안 멈추게
                    fileType: 'image/webp', // WebP로 변환
                });
                const { data, error } = await supabase.storage
                    .from('media')
                    .upload(
                        `${today.toISOString().slice(0, 10).replace(/-/g, '')}/${uuidv4()}.webp`,
                        webp,
                        { contentType: 'image/webp', upsert: true }
                    );
                if (error) throw error;

                newImagePaths.push({ url: data.path });
            } catch (error) { throw error; }
        }
        setImageList((prev) => [...prev, ...newImagePaths]);
        return newImagePaths;
    };

    const deleteImage = async (image) => {
        if (!image || !image.url) return;

        const { error } = await supabase.storage
            .from('media')
            .remove([image.url]); 

        if (error) {
            console.error('Failed to delete image:', image.url, error);
            return;
        }
        setImageList(prevList => prevList.filter(img => img.url !== image.url));
    };

    const getImages = (path) => {
        return `https://nvugjssjjxtbbjnwimek.supabase.co/storage/v1/object/public/media/${path?.url}`;
    };

    return {
        /** 이미지의 스토리지 경로 */
        images: imageList,
        /** supabase 스토리지에 webp로 업로드 */
        setImages: setWebp,
        /** 스토리지 경로로 가져오기 */
        getImages,
        deleteImage,
    };
};