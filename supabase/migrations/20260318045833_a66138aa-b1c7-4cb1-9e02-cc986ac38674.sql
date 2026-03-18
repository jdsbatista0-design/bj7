
UPDATE public.billboards SET 
  main_photo = 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
  gallery = ARRAY[
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'
  ],
  photos = ARRAY[
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80'
  ]
WHERE main_photo IS NULL OR main_photo = '';

UPDATE public.billboards SET 
  main_photo = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
  gallery = ARRAY[
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80'
  ]
WHERE code IN (SELECT code FROM public.billboards ORDER BY code LIMIT 3);

UPDATE public.billboards SET 
  main_photo = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
  gallery = ARRAY[
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'
  ]
WHERE code IN (SELECT code FROM public.billboards ORDER BY code OFFSET 3 LIMIT 3);

UPDATE public.billboards SET 
  main_photo = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  gallery = ARRAY[
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'
  ]
WHERE code IN (SELECT code FROM public.billboards ORDER BY code OFFSET 6 LIMIT 4)
