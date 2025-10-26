'use strict';

module.exports.calculate = async (event) => {
  try {
    // Parse input JSON
    const body = JSON.parse(event.body || '{}');
    const { operation, numbers } = body;

    if (!operation || !numbers || !Array.isArray(numbers)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please provide "operation" and "numbers" array' }),
      };
    }

    let result;
    switch (operation) {
      case 'add':
        result = numbers.reduce((a, b) => a + b, 0);
        break;
      case 'multiply':
        result = numbers.reduce((a, b) => a * b, 1);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Operation must be "add" or "multiply"' }),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
