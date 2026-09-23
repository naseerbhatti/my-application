// import { findDoc } from "../../../helpers/db/index.js";
// import { getSbcaFiles } from "../../../helpers/sbcaAuth.js";

// const sbcaAllFile = async (req, res) => {
//   try {
//     const keyword = req.query?.proposal_file_no?.trim() || "";
//     const limit = Number(req.query?.limit) || 50;
//     const offset = Number(req.query?.offset) || 0;

//     // Step 1: Send request to SBCA (keep it small & safe)
//     const formData = new FormData();
//     formData.append("limit", limit);
//     formData.append("offset", offset);

//     // IMPORTANT: only send search if it's meaningful
//     if (keyword.length > 2) {
//       formData.append("proposal_file_no", keyword);
//     }

//     const sbcaFilesData = await getSbcaFiles(formData);

//     if (!sbcaFilesData || !sbcaFilesData.data) {
//       return res.status(502).json({
//         success: false,
//         message: "Failed to fetch SBCA files or no data returned.",
//         data: null,
//       });
//     }

//     let files = sbcaFilesData.data;

//     // Step 2: LOCAL SMART SEARCH (MOST IMPORTANT FIX)
//     if (keyword) {
//       const lowerKeyword = keyword.toLowerCase();

//       files = files.filter((file) =>
//         file?.proposal_file_no?.toLowerCase().includes(lowerKeyword),
//       );
//     }

//     // Step 3: check DB existence flag
//     const filesWithExistenceFlag = await Promise.all(
//       files.map(async (file) => {
//         const existingFile = await findDoc("file", {
//           proposal_file_no: file.proposal_file_no,
//         });

//         return {
//           ...file,
//           file_exted: !!existingFile,
//         };
//       }),
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Files fetched successfully.",
//       data: filesWithExistenceFlag,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching SBCA files:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//       data: null,
//     });
//   }
// };

// export default sbcaAllFile;









import { findDoc } from '../../../helpers/db/index.js';
import { getSbcaFiles } from '../../../helpers/sbcaAuth.js';

const sbcaAllFile = async (req, res) => {
    try {

        // Step 1: Prepare form data for SBCA API call
        const formData = new FormData();
        formData.append('limit', req.query?.limit || 50);
        formData.append('offset', req.query?.offset || 0);
        formData.append('proposal_file_no', req.query?.proposal_file_no || '');


        // Step 2: Fetch files from SBCA backend API first
        const sbcaFilesData = await getSbcaFiles(formData);
        console.log(sbcaFilesData, "sbcaFilesData")
        if (!sbcaFilesData || !sbcaFilesData.data) {
            return res.status(502).json({
                success: false,
                message: "Failed to fetch SBCA files or no data returned.",
                data: null,
            });
        }



        const filesWithExistenceFlag = await Promise.all(
            sbcaFilesData.data.map(async (file, index) => {
                const existingFile = await findDoc("file", {
                    proposal_file_no: file.proposal_file_no
                });
                const fileExists = existingFile && existingFile;
                return {
                    ...file,
                    file_exted: fileExists
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "Files fetched successfully.",
            data: filesWithExistenceFlag,
        });
    } catch (error) {
        console.error("❌ Error fetching SBCA files:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default sbcaAllFile;
