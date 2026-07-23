export default function EmptyChatPage() {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 bg-[#efeae2]">
      <div className="text-center">
        <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        <p className="text-xl">اختر محادثة من القائمة للبدء</p>
      </div>
    </div>
  );
}