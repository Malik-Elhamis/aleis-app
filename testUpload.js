const BUCKET_NAME = "aleis-municipality.firebasestorage.app";
const filePath = "municipality_papers/test_paper.txt";
const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o?name=${encodeURIComponent(filePath)}`;
console.log(uploadUrl);
