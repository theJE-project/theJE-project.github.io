import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { getUser } from '../utils/getUser';
import { createClient } from '@supabase/supabase-js'

const url = "https://mkoiswzigibhylmtkzdh.supabase.co";
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2lzd3ppZ2liaHlsbXRremRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MjE3NzgsImV4cCI6MjA2MzE5Nzc3OH0.cYGkooDws3gZlgfjjyBXVg0yzA6mPC7Kp7StwHy6XHE'

export const supabase = createClient(url, key, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

export const useImage = (user) => {
    const [imageList, setImageList] = useState([]);

    // supabase 스토리지에 여러 장 이미지를 webp로 업로드
    const setWebp = async (e) => {
        const { user } = await getUser();
        const files = Array.from(e.target.files);
        if (!files.length || !user) return;

        let newImagePaths = [];

        for (const file of files) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert('JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.');
                continue;
            }
            try {
                const webp = await imageCompression(file, {
                    maxSizeMB: 1, // 최대 용량 (1MB 이하로 압축)
                    maxWidthOrHeight: 1480, // 최대 크기
                    useWebWorker: true, // ui가 안 멈추게
                    fileType: 'image/webp', // WebP로 변환
                });
                // 버킷에 업로드
                const { data, error } = await supabase.storage
                    .from('images')
                    .upload(
                        `${user.id}/${Date.now()}_${file.name}.webp`, // 파일 이름도 구분
                        webp,
                        { contentType: 'image/webp', upsert: true }
                    );
                if (error) throw error;
                newImagePaths.push(data.path);
            } catch (error) {
                console.warn('압축 실패:', error);
            }
        }

        // 여러 장을 한 번에 imageList에 추가
        setImageList((prev) => [...prev, ...newImagePaths]);
        console.log('업로드된 이미지 경로:', newImagePaths);
        return newImagePaths;
    };

    const getImages = (path) => {
        return `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;
    };

    return {
        /** 이미지의 스토리지 경로 */
        images: imageList,
        /** supabase 스토리지에 webp로 업로드 */
        setImages: setWebp,
        /** 스토리지 경로로 가져오기 */
        getImages,
        initImage:(init=[])=>{
            setImageList(init)
        }
    };
};