// Utility to parse request body based on content type

const parseRequest = async (request) => {
  let body = {};
  
  // Handle multipart/form-data
  if (request.isMultipart()) {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'field') {
        body[part.fieldname] = part.value;
      }
    }
  } else {
    // Handle JSON or form-urlencoded
    body = request.body;
  }
  
  return body;
};

module.exports = {
  parseRequest
};

