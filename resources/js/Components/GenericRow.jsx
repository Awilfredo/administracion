function GenericRow({ data }) {
    const keys = Object.keys(data);
    return (
        <tr>
            {keys.map((key, index) => (
                <td key={index} class="text-lg text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {data[key]}
                </td>
            ))}

        </tr>
    );
}

export default GenericRow;
