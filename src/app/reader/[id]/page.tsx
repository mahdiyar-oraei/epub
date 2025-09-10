'use client';

import { useParams } from 'next/navigation';
import ReaderInterface from '../../../components/reader/ReaderInterface';

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.id;

  return (
    <div className="h-screen">
      <ReaderInterface />
    </div>
  );
}
