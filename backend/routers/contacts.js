const express = require("express");
const router = express.Router();
const Contact = require("../models/ContactModel");
const mongoose = require("mongoose");
const verifyAuth = require("../controllers/auth");
/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Contact created
 *       400:
 *         description: Invalid data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.post("/", verifyAuth, async (req, res, cb) => {
    try {
        const { firstName, lastName, phone } = req.body;
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ "error": "All fields are required" })
        }
        const userId = req.userId
        const contact = new Contact({ firstName, lastName, phone, userId })
        await contact.save()
        return res.status(201).json({ id: contact._id })
    } catch (e) {
        return res.status(500).json({ "error": "internal server error" })
    }
})
/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts for the authenticated user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contacts list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       phone:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get("/", verifyAuth, async (req, res, cb) => {
    try {
        let formattedContacts = []
        const contacts = await Contact.find({ "userId": `${req.userId}` })
        contacts.forEach((contact) => {
            formattedContacts.push({
                "firstName": contact.firstName,
                "lastName": contact.lastName,
                "phone": contact.phone,
                "_id": contact._id
            })
        })
        return res.status(200).json({ contacts: formattedContacts })
    }
    catch (e) {
        return res.status(500).json({ "error": `error ${e}` })
    }
})
/**
 * @swagger
 * /contacts/{id}:
 *   patch:
 *     summary: Update an existing contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       200:
 *         description: Contact updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid data or contact not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.patch("/:id", verifyAuth, async (req, res, cb) => {
    const contactId = req.params.id;
    if (!mongoose.isValidObjectId(contactId)) {
        return res.status(400).json({ "error": "Invalid contact id" });
    }

    const allowedFields = ["firstName", "lastName", "phone"];
    const update = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            const value = req.body[key];
            if (typeof value !== "string") {
                return res.status(400).json({ "error": `type error ${key}` });
            }
            const trimmed = value.trim();
            if (trimmed.length === 0) {
                return res.status(400).json({ "error": `${key} cannot be empty` });
            }
            update[key] = trimmed;
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ "error": "At least one field must be provided" });
    }

    if (Object.prototype.hasOwnProperty.call(update, "phone")) {
        const phoneRegex = /^[+]?[\d\s\-().]{6,20}$/;
        if (!phoneRegex.test(update.phone)) {
            return res.status(400).json({ "error": "Invalid phone format" });
        }
    }

    const existing = await Contact.findById(contactId);
    if (!existing) {
        return res.status(404).json({ "error": "Contact not found" });
    }
    if (existing.userId != req.userId) {
        return res.status(403).json({ "error": "Not authorized to update this contact" });
    }

    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            contactId,
            { $set: update },
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            contact: {
                _id: updatedContact._id,
                firstName: updatedContact.firstName,
                lastName: updatedContact.lastName,
                phone: updatedContact.phone
            }
        });
    } catch (e) {
        return res.status(500).json({ "error": `Update contact error ${e}` });
    }
})
/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       204:
 *         description: Contact deleted
 *       404:
 *         description: Contact not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyAuth, async (req, res, cb) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        return res.status(404).json({ "error": "Contact not found" })
    }
    if (contact.userId != req.userId) {
        return res.status(403).json({ "error": "Not authorized to update this contact" });
    }
    try {
        const deletedContact = await Contact.deleteOne({ _id: req.params.id })
        return res.status(204).send()
    }
    catch (e) {
        return res.status(500).json({ "error": `Delete contact error ${e}` })
    }
})
module.exports = router;